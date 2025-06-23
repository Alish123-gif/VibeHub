import { Link } from "react-router-dom";

const FloatingActionButton = () => {
  return (
    <Link
      to="/create-post"
      className="fixed bottom-20 right-5 z-40 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 xl:hidden"
      aria-label="Create new post"
    >
      <img
        src="/assets/icons/add-post.svg"
        alt="Create post"
        width={24}
        height={24}
        className="invert"
      />
    </Link>
  );
};

export default FloatingActionButton;
