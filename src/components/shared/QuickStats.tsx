import { Models } from "appwrite";
import { useGetPosts } from "@/lib/react-query/queriesAndMutations";
import { Link } from "react-router-dom";
import Loader from "./Loader";

const QuickStats = () => {
  const { data: posts } = useGetPosts();

  if (!posts?.pages) {
    return (
      <div className="flex-center py-4">
        <Loader />
      </div>
    );
  }

  // Calculate stats
  let totalPosts = 0;
  let totalLikes = 0;
  let activeToday = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  posts.pages.forEach(page => {
    page.documents.forEach((post: Models.Document) => {
      totalPosts++;
      totalLikes += post.likes?.length || 0;
      
      const postDate = new Date(post.$createdAt);
      postDate.setHours(0, 0, 0, 0);
      
      if (postDate.getTime() === today.getTime()) {
        activeToday++;
      }
    });
  });

  const stats = [
    {
      label: "Posts Today",
      value: activeToday,
      icon: "/assets/icons/add-post.svg",
      color: "text-primary-500"
    },
    {
      label: "Total Posts",
      value: totalPosts > 999 ? `${Math.floor(totalPosts / 1000)}k+` : totalPosts,
      icon: "/assets/icons/posts.svg",
      color: "text-secondary-500"
    },
    {
      label: "Community Likes",
      value: totalLikes > 999 ? `${Math.floor(totalLikes / 1000)}k+` : totalLikes,
      icon: "/assets/icons/like.svg",
      color: "text-red"
    }
  ];

  return (
    <div className="bg-dark-2 rounded-2xl p-6 border border-dark-4">
      <h3 className="h3-bold text-light-1 mb-4">Community Stats</h3>
      <div className="flex flex-col gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dark-3 rounded-full flex items-center justify-center">
              <img 
                src={stat.icon} 
                alt={stat.label}
                width={20}
                height={20}
                className="invert-white"
              />
            </div>
            <div className="flex flex-col">
              <p className={`h3-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="small-regular text-light-3">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-dark-3 rounded-lg">
        <p className="small-regular text-light-3 text-center">
          Join the conversation and share your vibe!
        </p>
        <Link 
          to="/create-post"
          className="text-primary-500 small-medium hover:text-primary-600 transition-colors block text-center mt-2"
        >
          Create your first post
        </Link>
      </div>
    </div>
  );
};

export default QuickStats;
