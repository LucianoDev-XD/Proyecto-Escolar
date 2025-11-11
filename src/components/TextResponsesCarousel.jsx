import React, { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const TextResponsesCarousel = ({ responses, onResponseClick }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth);
    }
  };

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8; // Scroll by 80% of the visible width
      el.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      checkScrollability();
      el.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);

      return () => {
        el.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [responses]);

  if (!responses || responses.length === 0) return null;

  return (
    <div className="mt-4 relative sm:mt-5">
      <h4 className="text-sm font-semibold text-gray-700 mb-1 md:col-span-full sm:text-base">Opiniones detalladas:</h4>
      <div className="relative">
        <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-2 pb-4 scrollbar-hide sm:space-x-3">
          {responses.map((response, index) => (
            <div
              key={response.id || index}
              className="flex-none w-56 p-2 border border-gray-200 rounded-lg bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 sm:w-64 sm:p-3"
              onClick={() => onResponseClick(response)}
            >
              <p className="text-xs font-medium text-gray-800 truncate sm:text-sm">{response.texto}</p>
              <p className="text-xs text-gray-500 mt-1">Usuario anónimo</p>
            </div>
          ))}
        </div> 
        {canScrollLeft && <button onClick={() => handleScroll('left')} className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><FiChevronLeft className="h-5 w-5 text-gray-700 sm:h-6 sm:w-6" /></button>}
        {canScrollRight && <button onClick={() => handleScroll('right')} className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><FiChevronRight className="h-5 w-5 text-gray-700 sm:h-6 sm:w-6" /></button>}
      </div>
    </div>
  );
};

export default TextResponsesCarousel;