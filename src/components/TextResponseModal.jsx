import React from 'react';
import { FiX } from 'react-icons/fi';

const TextResponseModal = ({ isOpen, onClose, response }) => {
  if (!isOpen || !response) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4 relative sm:max-w-md md:max-w-lg sm:p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
          aria-label="Cerrar"
        >
          <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <h3 className="text-base font-bold text-gray-800 mb-2 sm:text-lg">{response.preguntaTexto}</h3>
        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap sm:text-base sm:mb-4">{response.texto}</p>
        <p className="text-xs text-gray-500 text-right sm:text-sm">Usuario anónimo</p>
      </div>
    </div>
  );
};

export default TextResponseModal;