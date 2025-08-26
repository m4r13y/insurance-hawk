import { libraryData } from './libraryData';

export function HeroSection() {
  return (
    <div className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {libraryData.hero.title}
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
            {libraryData.hero.description}
          </p>
        </div>
      </div>
    </div>
  );
}
