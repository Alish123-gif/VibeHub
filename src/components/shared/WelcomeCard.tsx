import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const WelcomeCard = () => {
  const { user } = useUserContext();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/90 to-primary-600/90 backdrop-blur-sm rounded-3xl p-8 mb-12 text-white border border-primary-400/20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/50 rounded-full -translate-x-12 -translate-y-12"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="Profile"
              className="w-16 h-16 rounded-full border-3 border-white/30 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">👋</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="h2-bold mb-1">Welcome back, {user.name}!</h2>
            <p className="body-medium opacity-90">Ready to share your vibe with the world?</p>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-8">
          <p className="body-medium opacity-95 leading-relaxed">
            Your feed is looking a bit quiet. Start by creating your first post, discovering amazing content, or connecting with like-minded creators in our vibrant community.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link 
            to="/create-post"
            className="group bg-white text-primary-500 px-6 py-4 rounded-xl font-semibold hover:bg-white/95 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <img 
              src="/assets/icons/add-post.svg" 
              alt="Create" 
              width={20} 
              height={20}
              className="group-hover:scale-110 transition-transform"
            />
            <span>Create Post</span>
          </Link>
          
          <Link 
            to="/all-users"
            className="group bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3 border border-white/20"
          >
            <img 
              src="/assets/icons/people.svg" 
              alt="People" 
              width={20} 
              height={20} 
              className="invert group-hover:scale-110 transition-transform" 
            />
            <span>Find People</span>
          </Link>
          
          <Link 
            to="/explore"
            className="group bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3 border border-white/20"
          >
            <img 
              src="/assets/icons/wallpaper.svg" 
              alt="Explore" 
              width={20} 
              height={20} 
              className="invert group-hover:scale-110 transition-transform" 
            />
            <span>Explore</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
