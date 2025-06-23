import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import RightSidebar from "@/components/shared/RightSidebar";
import WelcomeCard from "@/components/shared/WelcomeCard";
import FloatingActionButton from "@/components/shared/FloatingActionButton";
import { useGetRecentPost } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";


function Home() {
  const { data: posts, isPending: isPostLoading, isError: isErrorPosts } = useGetRecentPost();
  return (
    <>
      <div className="flex flex-1 gap-6 xl:gap-8 h-full">
        {/* Main Content Area */}        <div className="flex-1 flex flex-col items-center h-full overflow-y-auto">
          <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10 mobile-bottom-spacing">
            {/* Header Section */}
            <div className="mb-8 lg:mb-12">
              <h1 className="h2-bold md:h1-bold text-left w-full mb-2">Home Feed</h1>
              <p className="body-medium text-light-3">Stay connected with your community</p>
            </div>

            {/* Content Section */}
            <div className="w-full">
              {isPostLoading && !posts ? (
                <div className="flex-center py-20">
                  <Loader />
                </div>
              ) : (
                <>
                  {(!posts?.documents || posts.documents.length === 0) ? (
                    <WelcomeCard />
                  ) : (
                    <div className="space-y-8 lg:space-y-12">
                      {posts.documents.map((post: Models.Document) => (
                        <PostCard post={post} key={post.$id}/>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <RightSidebar />
      </div>
      
      {/* Floating Action Button for Mobile */}
      <FloatingActionButton />
    </>
  )
}

export default Home