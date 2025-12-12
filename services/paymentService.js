import apiClient from "@/libs/api";

export const handlePayment = async (priceId, mode = "payment") => {
    try {
        const res = await apiClient.post("/stripe/create-checkout", {
            priceId,
            mode,
            successUrl: window.location.href,
            cancelUrl: window.location.href,
            couponId: 'qEUaRv2F'
        });

        window.location.href = res.url;
    } catch (e) {
        console.error(e);
    }
};