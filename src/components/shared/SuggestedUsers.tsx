import { Link } from "react-router-dom";
import { Models } from "appwrite";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "./Loader";
import FollowButton from "./FollowButton";

const SuggestedUsers = () => {
  const { user } = useUserContext();
  const { data: users, isLoading } = useGetUsers();

  if (isLoading) {
    return (
      <div className="bg-dark-2/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-4/30">
        <div className="flex-center py-8">
          <Loader />
        </div>
      </div>
    );
  }

  if (!users?.documents) {
    return null;
  }

  // Filter out current user and get users they're not following
  const suggestedUsers = users.documents
    .filter((suggestedUser: Models.Document) => {
      if (suggestedUser.$id === user.id) return false;
      
      // Check if current user is already following this user
      // user.following is an array of follow documents with a 'followed' property
      const isAlreadyFollowing = user.following?.some(
        (followRecord: any) => followRecord.followed?.$id === suggestedUser.$id
      );
      
      return !isAlreadyFollowing;
    })
    .slice(0, 4); // Show max 4 suggested users for better layout

  if (suggestedUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-dark-2/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-4/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="h3-bold text-light-1">Suggested for you</h3>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {suggestedUsers.map((suggestedUser: Models.Document) => (
          <div key={suggestedUser.$id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-dark-3/50 transition-all duration-300">
            <Link to={`/profile/${suggestedUser.$id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <img
                  src={suggestedUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt={suggestedUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-dark-4 group-hover:border-primary-500/30 transition-colors"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="base-medium text-light-1 truncate group-hover:text-primary-500 transition-colors">
                  {suggestedUser.name}
                </p>
                <p className="small-regular text-light-3 truncate">
                  @{suggestedUser.username}
                </p>
              </div>
            </Link>
            <div className="ml-3 flex-shrink-0">
              <FollowButton currentUser={suggestedUser} />
            </div>
          </div>
        ))}
      </div>
      
      <Link 
        to="/all-users" 
        className="group flex items-center justify-center gap-2 text-primary-500 small-medium hover:text-primary-400 transition-colors mt-6 p-3 rounded-xl hover:bg-primary-500/10"
      >
        <span>Discover more people</span>
        <img 
          src="/assets/icons/right-arrow.svg" 
          alt="Arrow" 
          width={16} 
          height={16}
          className="invert group-hover:translate-x-1 transition-transform"
        />
      </Link>
    </div>
  );
};

export default SuggestedUsers;
