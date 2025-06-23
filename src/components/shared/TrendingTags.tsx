import { useGetPosts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import Loader from "./Loader";

const TrendingTags = () => {
  const { data: posts } = useGetPosts();

  if (!posts?.pages) {
    return (
      <div className="flex-center py-4">
        <Loader />
      </div>
    );
  }

  // Extract and count tags from all posts
  const tagCounts: { [key: string]: number } = {};
  
  posts.pages.forEach(page => {
    page.documents.forEach((post: Models.Document) => {
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach((tag: string) => {
          if (tag.trim()) {
            const cleanTag = tag.toLowerCase().trim();
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          }
        });
      }
    });
  });

  // Get top 8 trending tags
  const trendingTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  if (trendingTags.length === 0) {
    return null;
  }

  return (
    <div className="bg-dark-2 rounded-2xl p-6 border border-dark-4">
      <h3 className="h3-bold text-light-1 mb-4">Trending Tags</h3>
      <div className="flex flex-col gap-3">        {trendingTags.map(({ tag, count }) => (
          <div
            key={tag}
            className="flex items-center justify-between hover:bg-dark-3 rounded-lg p-2 -m-2 transition-colors group cursor-pointer"
            onClick={() => {
              // We'll navigate to explore with a search for this tag
              window.location.href = `/explore?search=${encodeURIComponent(tag)}`;
            }}
          >
            <div className="flex flex-col">
              <p className="base-medium text-light-1 group-hover:text-primary-500 transition-colors">
                #{tag}
              </p>
              <p className="small-regular text-light-3">
                {count} {count === 1 ? 'post' : 'posts'}
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-500 text-xs font-medium">
                {count > 99 ? '99+' : count}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Link 
        to="/explore" 
        className="text-primary-500 small-medium hover:text-primary-600 transition-colors mt-4 block text-center"
      >
        Explore more
      </Link>
    </div>
  );
};

export default TrendingTags;
