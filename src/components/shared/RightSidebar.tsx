import SuggestedUsers from "./SuggestedUsers";
import TrendingTags from "./TrendingTags";
import QuickStats from "./QuickStats";
import RecentActivity from "./RecentActivity";

const RightSidebar = () => {
  return (
    <aside className="home-creators">
      <div className="space-y-6">
        {/* Quick Stats - Most important, shown first */}
        <QuickStats />
        
        {/* Suggested Users - Social connection */}
        <SuggestedUsers />
        
        {/* Recent Activity - Engagement and updates */}
        <RecentActivity/>
        
        {/* Trending Tags - Discovery */}
        <TrendingTags />
      </div>
    </aside>
  );
};

export default RightSidebar;
