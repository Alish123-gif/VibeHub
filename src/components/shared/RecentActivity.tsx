import { useGetRecentPost } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { timeAgo } from "@/lib/utils";
import Loader from "./Loader";

const RecentActivity = () => {
  const { user } = useUserContext();
  const { data: posts, isLoading } = useGetRecentPost();

  if (isLoading) {
    return (
      <div className="flex-center py-4">
        <Loader />
      </div>
    );
  }

  if (!posts?.documents) {
    return null;
  }

  // Get recent activity (posts from users the current user follows)
  const recentActivity = posts.documents
    .filter((post: Models.Document) => {
      // Only show posts from followed users, not the current user's posts
      if (post.creator.$id === user.id) return false;
      
      const isFromFollowedUser = user.following?.some(
        (followRecord: any) => followRecord.followed?.$id === post.creator.$id
      );
      
      return isFromFollowedUser;
    })
    .slice(0, 3); // Show max 3 recent activities

  if (recentActivity.length === 0) {
    return (
      <div className="bg-dark-2 rounded-2xl p-6 border border-dark-4">
        <h3 className="h3-bold text-light-1 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center gap-3 py-4">
          <img 
            src="/assets/icons/people.svg" 
            alt="No activity"
            width={32}
            height={32}
            className="opacity-50 invert-white"
          />
          <p className="small-regular text-light-3 text-center">
            Follow some users to see their activity here!
          </p>
          <Link 
            to="/all-users"
            className="text-primary-500 small-medium hover:text-primary-600 transition-colors"
          >
            Discover People
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-2 rounded-2xl p-6 border border-dark-4">
      <h3 className="h3-bold text-light-1 mb-4">Recent Activity</h3>
      <div className="flex flex-col gap-4">
        {recentActivity.map((post: Models.Document) => (
          <Link 
            key={post.$id} 
            to={`/posts/${post.$id}`}
            className="flex items-center gap-3 hover:bg-dark-3 rounded-lg p-2 -m-2 transition-colors group"
          >
            <img
              src={post.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={post.creator.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <p className="small-medium text-light-1 truncate">
                <span className="text-primary-500">{post.creator.name}</span> shared a post
              </p>
              <p className="tiny-medium text-light-3">
                {timeAgo(post.$createdAt)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>
      <Link 
        to="/explore" 
        className="text-primary-500 small-medium hover:text-primary-600 transition-colors mt-4 block text-center"
      >
        See all activity
      </Link>
    </div>
  );
};

export default RecentActivity;
