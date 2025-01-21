const TabButton = ({ isActive, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
         ${isActive
           ? 'bg-[#727D73] text-[#F0F0D7]'
           : 'text-[#727D73] hover:bg-[#D0DDD0]'}`}
    >
      {children}
    </button>
  );
  
  export default TabButton;