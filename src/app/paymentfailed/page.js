export default function PaymentFailedPage() {
    return (
        <>
            <div className="h-screen w-full flex justify-center items-center">
                <h1 className="text-3xl text-red-600 font-[600]">
                    Payment Failed
                </h1>
                <p className="text-blue-500">
                    Please try again or contact us for assistance.
                </p>
            </div>
        </>
    )
}