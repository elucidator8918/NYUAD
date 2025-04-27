import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter
from copy import deepcopy
import xlrd
from tqdm import tqdm
import rydiqule as rq
import numpy as np
import matplotlib.pyplot as plt
import rydiqule as rq
from rydiqule.solvers import solve_steady_state
from rydiqule.sensor_utils import convert_dm_to_complex

def simulate_tectonic_emissions(
    total_time_yr=1_000,          # simulation span in years
    dt_yr=0.01,                   # time step in years
    V=1,                       # plate velocity (m/s)
    k=5e10,                       # shear stiffness (Pa m^-1)
    sigma_mean=50e5,              # mean failure stress (Pa)
    sigma_std=5e3,                # std dev of failure stress (Pa)
    sigma_residual=10e6,          # residual stress (Pa)
    alpha_mean=2e-6,              # mean coupling (kg s^-1 Pa^-1)
    alpha_std=0.5e-6,             # std dev of coupling
    seed=None                     # RNG seed for reproducibility
):
    """Return DataFrame with times, stress drops and emissions."""
    rng = np.random.default_rng(seed)
    # convert years → seconds so V fits SI units
    dt = dt_yr * 365.25 * 24 * 3600
    total_steps = int(total_time_yr / dt_yr)

    # state variables
    slip = 0.0                     # cumulative relaxed slip (m)
    sigma_c = rng.normal(sigma_mean, sigma_std)   # next threshold
    alpha = rng.normal(alpha_mean, alpha_std)     # next α
    stress = 0.0

    records = []  # store events

    for step in range(total_steps):
        # advance time and stress
        stress += k * V * dt        # Δσ = k V Δt  (because slip is fixed between events)

        # check for failure
        if stress >= sigma_c:
            delta_sigma = stress - sigma_residual
            Q = alpha * delta_sigma

            t_years = step * dt_yr
            records.append((t_years, delta_sigma, Q))

            # reset state for next cycle
            slip += delta_sigma / k          # equivalent relaxed slip
            stress = sigma_residual
            sigma_c = rng.normal(sigma_mean, sigma_std)
            alpha = rng.normal(alpha_mean, alpha_std)

    return pd.DataFrame(records, columns=["time_years", "stress_drop_Pa", "emission_Q"])
"""
def simulate_tectonic_emissions_and_seismic(
    total_time_yr=1_000,
    dt_yr=0.01,
    V = 1.2e-9,              # m/s (≈ 3.8 cm/year relative motion)
    k = 5e10,                # Pa/m (keep it)
    sigma_mean = 80e6,       # 80 MPa mean friction stress
    sigma_std = 10e6,        # 10 MPa std dev
    sigma_residual = 0,   # 10 MPa residual stress
    alpha_mean = 2e-6,       # (1/s) healing rate
    alpha_std = 0.5e-6,      # (1/s) std
    stress_drop_seismic_threshold = 20e3,  # 20 MPa needed for earthquakes
    beta_seismic = 1e-10,    # scaling of seismic energy
    seed=None
    ):
    #Return DataFrame with time, stress drop, emission Q, seismic output.
    rng = np.random.default_rng(seed)
    dt = dt_yr * 365.25 * 24 * 3600  # time step in seconds
    total_steps = int(total_time_yr / dt_yr)
    print(total_steps)

    # state variables
    slip = 0.0
    sigma_c = rng.normal(sigma_mean, sigma_std)
    alpha = rng.normal(alpha_mean, alpha_std)
    stress = 0.0

    records = []

    for step in range(total_steps):
        stress += k * V * dt  # stress accumulation

        if stress >= sigma_c:
            delta_sigma = stress - sigma_residual
            Q = alpha * delta_sigma

            # Check if seismic event occurs
            if delta_sigma >= stress_drop_seismic_threshold:
                seismic_output = beta_seismic * (delta_sigma ** 2)
            else:
                seismic_output = 0.0

            t_years = step * dt_yr
            records.append((t_years, delta_sigma, Q, seismic_output))

            # reset for next cycle
            slip += delta_sigma / k
            stress = sigma_residual
            sigma_c = rng.normal(sigma_mean, sigma_std)
            alpha = rng.normal(alpha_mean, alpha_std)

    return pd.DataFrame(records, columns=["time_years", "stress_drop_Pa", "emission_Q", "seismic_output"])
"""
def simulate_tectonic_emissions_and_seismic(
    total_time_yr=1_000,
    dt_yr=0.01,
    V=1.2e-9,              # m/s (~3.8 cm/year)
    k=5e10,                # Pa/m
    sigma_mean=80e6,       # 80 MPa
    sigma_std=10e6,        # 10 MPa
    sigma_residual=0.0,    # 0 Pa after seismic reset
    alpha_mean=2e-6,       # (1/s)
    alpha_std=0.5e-6,      # (1/s)
    stress_drop_seismic_threshold=20e8,  # 20 MPa
    beta_seismic=1e-10,    # scaling of seismic energy
    seed=None
):
    """Return DataFrame with time, stress drop, emission Q, seismic output."""
    
    rng = np.random.default_rng(seed)
    dt = dt_yr * 365.25 * 24 * 3600  # convert dt from years to seconds
    total_steps = int(total_time_yr / dt_yr)

    # State variables
    slip = 0.0
    sigma_c = rng.normal(sigma_mean, sigma_std)  # critical stress to rupture
    alpha = rng.normal(alpha_mean, alpha_std)    # emission coefficient
    stress = 0.0                                 # initial stress

    records = []

    for step in range(total_steps):
        t_years = step * dt_yr

        # 1. Stress accumulation from plate motion
        stress += k * V * dt

        # 2. Continuous emission due to tension (NOT only at rupture)
        Q = alpha * stress * dt  # emission proportional to current stress

        if stress >= stress_drop_seismic_threshold:
            seismic_output = beta_seismic * stress
            stress = sigma_residual
        else:
            seismic_output = 0.0


        alpha = rng.normal(alpha_mean, alpha_std)

        # 4. Record
        records.append((t_years, stress, Q, seismic_output))

    return pd.DataFrame(records, columns=["time_years", "stress_Pa", "emission_Q", "seismic_output"])


def simulate_ionization_bursts(df,
                                hole_threshold=0.1,  # threshold of hole mass to trigger a burst (kg)
                                gamma_conversion=1e5, # conversion J/kg
                                energy_distribution={"UV":0.4, "Vis-NIR":0.3, "IR":0.3}):
    """Simulate ionization bursts when holes accumulate."""
    accumulated_holes = 0.0
    bursts = []

    for idx, row in df.iterrows():
        accumulated_holes += row["emission_Q"]

        if accumulated_holes >= hole_threshold:
            # Ionization event triggered
            E_pulse = gamma_conversion * accumulated_holes  # total energy released

            # Split energy
            E_uv = energy_distribution["UV"] * E_pulse
            E_visnir = energy_distribution["Vis-NIR"] * E_pulse
            E_ir = energy_distribution["IR"] * E_pulse

            bursts.append({
                "accumulated_holes_kg": 0,
                "E_uv_J": E_uv/1e4,
                "E_visnir_J": E_visnir/1e4,
                "E_ir_J": E_ir/1e4
            })

    return pd.DataFrame(bursts)

def update_surface_hole_accumulation(
    surface_holes,         # 2D array: current accumulated holes map
    terrain_map,           # 2D array: altitude map z(x,y)
    x_idx_source,          # int: x index of emission source
    y_idx_source,          # int: y index of emission source
    emitted_holes,         # float: amount of holes emitted now
    surface_diffusion_sigma=1.0,  # sigma of lateral diffusion
    altitude_attraction_strength=0.005             # attraction to high altitude
):
    """
    Update surface holes accumulation with a new emission.
    No renormalization. True physical accumulation.
    """

    # Grid shape
    nx, ny = surface_holes.shape

    # Create a temp grid for new emitted holes
    temp_grid = np.zeros((nx, ny))
    temp_grid[x_idx_source, y_idx_source] += emitted_holes  # inject emission at source

    # Apply Gaussian spreading
    temp_grid = gaussian_filter(temp_grid, sigma=surface_diffusion_sigma)

    # Altitude attraction
    z_mean = np.mean(terrain_map)
    z_normalized = terrain_map - z_mean
    attraction = 1.0 + altitude_attraction_strength * z_normalized
    temp_grid *= attraction

    # No Renormalization: we keep total quantity physical

    # Update the surface accumulation
    surface_holes += temp_grid

    return surface_holes

def fmt_B(B): return f"{B*1e6:.0f} µT" if B < 1e-3 else f"{B*1e3:.1f} mT"

# ---------------------------------------------------------------------------
# CORE FUNCTION
# ---------------------------------------------------------------------------
def rydberg_dm_fixed_lasers(
        B_T,
        mF_g=0, mF_e=+1, mF_r=+1,
        gF_e=0.50, gF_r=0.50,
        probe_rabi=2*np.pi*1e5,      # 100 kHz
        coupling_rabi=2*np.pi*3e5,   # 300 kHz
        gamma_ge=2*np.pi*5e4,        # 50 kHz   (narrowed linewidth)
        gamma_er=2*np.pi*1e4,        # 10 kHz
        extra_dephasing=2*np.pi*1e4  # homogeneous decoherence 10 kHz
    ):
    MU_B_OVER_HBAR = 1.399_624_60e6 * 2 * np.pi   # rad s⁻¹ T⁻¹  (CODATA 2018)
    # helper for a nice label later
    """
    Steady-state density matrix ρ(B) for a 3-level ladder {|g>,|e>,|r>}.
    All rates in rad s⁻¹; B in Tesla.
    """
    # Zeeman shifts (rad s⁻¹)
    δe =  MU_B_OVER_HBAR * gF_e * mF_e * B_T
    δr =  MU_B_OVER_HBAR * gF_r * mF_r * B_T

    # -----------------------------------------------------------------------
    # Build the sensor
    s = rq.Sensor(3)                           # |0>=|g>, |1>=|e>, |2>=|r|
    Γ = np.zeros((3, 3))
    Γ[1, 0] = gamma_ge
    Γ[2, 1] = gamma_er
    s.set_gamma_matrix(Γ)

    # Optional homogeneous dephasing (same for every off-diag element)
    #if extra_dephasing:
    #    pairs = [(i, j) for i in range(3) for j in range(3) if i != j]
    #    s.add_decoherence_group(pairs, extra_dephasing)

    # -----------------------------------------------------------------------
    # Lasers remain tuned to ZERO-FIELD transition
    # → detunings equal the (negative) Zeeman shifts
    s.add_coupling(                       # probe |g> ↔ |e>
        states        = (0, 1),
        rabi_frequency= probe_rabi,
        detuning      = -δe
    )
    s.add_coupling(                       # coupling |e> ↔ |r>
        states        = (1, 2),
        rabi_frequency= coupling_rabi,
        detuning      = -(δr - δe)
    )

    sol = solve_steady_state(s)
    ρ = convert_dm_to_complex(sol.rho).reshape(3, 3)
    return ρ


def rebuild_full_rho_from_vector(rho_vec):
    """
    Rebuild the full 3x3 density matrix from a reduced 8-element vector
    assuming the missing element is rho[0,0].
    """

    # Create empty 3x3 matrix
    rho_full = np.zeros((3,3), dtype=complex)

    # Fill known elements
    rho_full[1,0] = rho_vec[0]
    rho_full[2,0] = rho_vec[1]
    rho_full[0,1] = rho_vec[2]
    rho_full[2,1] = rho_vec[3]
    rho_full[0,2] = rho_vec[4]
    rho_full[1,2] = rho_vec[5]
    rho_full[1,1] = rho_vec[6]
    rho_full[2,2] = rho_vec[7]

    # Now reconstruct rho[0,0] to satisfy trace = 1
    rho_full[0,0] = 1.0 - np.real(rho_full[1,1]) - np.real(rho_full[2,2])

    return rho_full


def run_full_surface_hole_simulation_with_ionization(
    terrain_3d_map,
    x_coords,
    y_coords,
    source_positions,
    sensor_positions,
    measurement_function=rydberg_dm_fixed_lasers,
    hole_burst_threshold=1e-2,
    gamma_conversion=1e5,
    surface_diffusion_sigma=5,
    altitude_attraction_strength=5,
    v_upward=0.01,
    total_time_yr=500,
    dt_yr=1,
    seed=42
):
    """
    Full simulation using simulate_ionization_bursts pointwise per map point,
    and updating ground hole accumulation and Rydberg sensor measurements.
    """

    # 1. Simulate tectonic emissions
    surface_holes = np.zeros_like(terrain_3d_map)
    tectonic_emissions_df = simulate_tectonic_emissions_and_seismic(
        total_time_yr=total_time_yr,
        dt_yr=dt_yr,
        seed=seed
    )
    
    times = tectonic_emissions_df["time_years"].values
    nx, ny = terrain_3d_map.shape
    nt = len(times)

    # Initialize storage
    ground_accumulation_times = np.zeros((nt, nx, ny))
    burst_map_times = np.empty((nt, nx, ny), dtype=object)   # Now storing dictionaries per point
    measurement_map_times = np.empty((nt, len(sensor_positions)), dtype=object)  # density matrices

    # Precompute time to surface for each source
    source_times_to_surface = []
    for (x_idx, y_idx, depth) in source_positions:
        t_up = depth / v_upward / (365.25 * 24 * 3600)  # seconds to years
        source_times_to_surface.append(t_up)

    # Main loop over time
    for t_idx, current_time in enumerate(times):
        print("current time step ", t_idx)
        # 2.1 Emit holes arriving at surface now
        for emission_idx, row in tectonic_emissions_df.iterrows():
            emission_time = row["time_years"]
            Q_emission = row["emission_Q"]
            
            for i_source, (x_idx, y_idx, depth) in enumerate(source_positions):
                arrival_time = emission_time + source_times_to_surface[i_source]
                if np.abs(arrival_time - current_time) < dt_yr/2:
                    surface_holes = update_surface_hole_accumulation(
                        surface_holes,
                        terrain_3d_map,
                        x_idx,
                        y_idx,
                        Q_emission,
                        surface_diffusion_sigma=surface_diffusion_sigma,
                        altitude_attraction_strength=altitude_attraction_strength
                    )

        # 2.2 Improved burst computation using simulate_ionization_bursts pointwise
        burst_map = np.empty_like(surface_holes, dtype=object)

        for ix in range(surface_holes.shape[0]):
            for iy in range(surface_holes.shape[1]):
                local_holes = surface_holes[ix, iy]

                # Create a mini emission DF for this (ix, iy)
                df_local = pd.DataFrame({
                    "time_years": [current_time],
                    "emission_Q": [local_holes]
                })

                # Simulate burst
                local_bursts_df = simulate_ionization_bursts(
                    df_local,
                    hole_threshold=hole_burst_threshold,
                    gamma_conversion=gamma_conversion,
                )

                if not local_bursts_df.empty:
                    # Burst happened
                    burst_info = {
                        "E_uv_J": local_bursts_df["E_uv_J"].values[0],
                        "E_visnir_J": local_bursts_df["E_visnir_J"].values[0],
                        "E_ir_J": local_bursts_df["E_ir_J"].values[0]
                    }
                    burst_map[ix, iy] = burst_info
                    surface_holes[ix, iy] = 0.0  # Reset holes if burst occurs
                else:
                    # No burst
                    burst_map[ix, iy] = {
                        "E_uv_J": 0.0,
                        "E_visnir_J": 0.0,
                        "E_ir_J": 0.0
                    }

        # Save burst map at this timestep
        burst_map_times[t_idx] = deepcopy(burst_map)

        # 2.3 Sensor measurements
        for sensor_idx, (x_s, y_s) in enumerate(sensor_positions):
            burst_value = burst_map[x_s, y_s]
            rho_ss = measurement_function(burst_value, sensor_idx, t_idx)
            measurement_map_times[t_idx, sensor_idx] = rho_ss

        # Save ground accumulation
        ground_accumulation_times[t_idx] = deepcopy(surface_holes)

    return tectonic_emissions_df, burst_map_times, measurement_map_times, ground_accumulation_times


def compute_time_differences(file_path):
    # Read the file (only the second column)
    df = pd.read_csv(file_path)
    signal = df.iloc[:, 1]  # second column (index 1)
    
    results = []
    t_tot = None  # to store the last high value before drop
    
    for i in range(len(signal)//10000):
        k = i*10000
        current_value = signal.iloc[k]
        
        if k == 0 or signal.iloc[k]> signal.iloc[k-10000]:
            t_tot = current_value
        
        if t_tot is not None:
            delta_t = (t_tot - current_value)/t_tot
            results.append(delta_t)
        else:
            results.append(float('nan'))

    return results

def run_full_surface_hole_simulation_from_data(
    terrain_3d_map,
    x_coords,
    y_coords,
    big_data,
    source_positions,
    sensor_positions,
    measurement_function=rydberg_dm_fixed_lasers,
    hole_burst_threshold=1e-2,
    gamma_conversion=1e5,
    surface_diffusion_sigma=5,
    altitude_attraction_strength=5,
    v_upward=0.01
):
    """
    Full simulation using simulate_ionization_bursts pointwise per map point,
    and updating ground hole accumulation and Rydberg sensor measurements.
    """

    # 1. Simulate tectonic emissions
    surface_holes = np.zeros_like(terrain_3d_map)
    records=[]

    for i in range(len(big_data)):
        Q= 1 - np.exp(-big_data[i])
        records.append((i, big_data[i], Q, 0))

    tectonic_emissions_df = pd.DataFrame(records, columns=["time_years", "stress_Pa", "emission_Q", "seismic_output"])
    
    times = tectonic_emissions_df["time_years"].values
    nx, ny = terrain_3d_map.shape
    nt = len(times)

    # Initialize storage
    ground_accumulation_times = np.zeros((nt, nx, ny))
    burst_map_times = np.empty((nt, nx, ny), dtype=object)   # Now storing dictionaries per point
    measurement_map_times = np.empty((nt, len(sensor_positions)), dtype=object)  # density matrices

    # Precompute time to surface for each source
    source_times_to_surface = []
    for (x_idx, y_idx, depth) in source_positions:
        t_up = depth / v_upward / (365.25 * 24 * 3600)  # seconds to years
        source_times_to_surface.append(t_up)

    # Main loop over time
    for emission_idx, row in tqdm(tectonic_emissions_df.iterrows(), total=len(tectonic_emissions_df)):
        time = row["time_years"]
        Q_emission = row["emission_Q"]
            
        for i_source, (x_idx, y_idx, depth) in enumerate(source_positions):
            arrival_time = time + source_times_to_surface[i_source]
            if np.abs(arrival_time - time) < 1/2:
                surface_holes = update_surface_hole_accumulation(
                    surface_holes,
                    terrain_3d_map,
                    x_idx,
                    y_idx,
                    Q_emission,
                    surface_diffusion_sigma=surface_diffusion_sigma,
                    altitude_attraction_strength=altitude_attraction_strength
                )

        # 2.2 Improved burst computation using simulate_ionization_bursts pointwise
        burst_map = np.empty_like(surface_holes, dtype=object)

        for ix in range(surface_holes.shape[0]):
            for iy in range(surface_holes.shape[1]):
                local_holes = surface_holes[ix, iy]

                # Create a mini emission DF for this (ix, iy)
                df_local = pd.DataFrame({
                    "time_years": [time],
                    "emission_Q": [local_holes]
                })

                # Simulate burst
                local_bursts_df = simulate_ionization_bursts(
                    df_local,
                    hole_threshold=hole_burst_threshold,
                    gamma_conversion=gamma_conversion,
                )

                if not local_bursts_df.empty:
                    # Burst happened
                    burst_info = {
                        "E_uv_J": local_bursts_df["E_uv_J"].values[0],
                        "E_visnir_J": local_bursts_df["E_visnir_J"].values[0],
                        "E_ir_J": local_bursts_df["E_ir_J"].values[0]
                    }
                    burst_map[ix, iy] = burst_info
                    surface_holes[ix, iy] = 0.0  # Reset holes if burst occurs
                else:
                    # No burst
                    burst_map[ix, iy] = {
                        "E_uv_J": 0.0,
                        "E_visnir_J": 0.0,
                        "E_ir_J": 0.0
                    }

        # Save burst map at this timestep
        burst_map_times[emission_idx] = deepcopy(burst_map)

        # 2.3 Sensor measurements
        for sensor_idx, (x_s, y_s) in enumerate(sensor_positions):
            burst_value = burst_map[x_s, y_s]
            rho_ss = measurement_function(burst_value.get("E_visnir_J", 0.0)/200)
            measurement_map_times[emission_idx, sensor_idx] = rho_ss

        # Save ground accumulation
        ground_accumulation_times[emission_idx] = deepcopy(surface_holes)

    return tectonic_emissions_df, burst_map_times, measurement_map_times, ground_accumulation_times

