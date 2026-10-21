import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-neutral-200 bg-white py-6 text-center text-xs tracking-widest text-neutral-500 uppercase">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="font-serif font-medium text-neutral-800 tracking-[0.2em]">
          Next Fashion Textile
        </span>
        <p>&copy; {currentYear} All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
