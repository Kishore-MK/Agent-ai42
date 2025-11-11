{
    name: "sendPayment",
    description: "Sends a payment using x402",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        amount: { type: "number" },
        recipient: { type: "string" },
      },
      required: ["url", "amount", "recipient"],
    },
    async execute(input) {
      try {
        const { url, amount, recipient } = input as {
          url: string;
          amount: number;
          recipient: string;
        };

        // Prepare payment request
        const response = await paymentClient.fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, recipient }),
        });

        const paymentInfo = paymentClient["extractPaymentInfo"](response);

        if (!paymentInfo) {
          return ToolResponse.error("No payment info returned from server");
        }

        return ToolResponse.success({
          message: "Payment successful",
          data: paymentInfo,
        });
      } catch (err: any) {
        return ToolResponse.error(err.message || "Payment failed");
      }
    },
  };