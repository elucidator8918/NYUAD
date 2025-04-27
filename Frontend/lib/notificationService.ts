export const subscribeSMS = async (phoneNumber: string) => {

    try {
      return { 
        success: true, 
        message: "SMS notifications enabled. You'll receive alerts at " + phoneNumber 
      };
    } catch (error) {
      throw new Error("Failed to subscribe to SMS notifications");
    }
  };