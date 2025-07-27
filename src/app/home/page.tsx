
"use client";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white shadow-xl">
                    <div className="max-w-4xl">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 lg:mb-4">
                            The Insurance Hawk!
                        </h1>
                        <p className="text-blue-100 text-base lg:text-lg leading-relaxed opacity-90 max-w-3xl">
                           Save your money - Keep your freedom!
                        </p>
                    </div>
                </div>
            </div>
        </div>    
    );
}
    

    

