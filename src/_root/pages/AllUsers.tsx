import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AllUsers = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useUserContext();
  const { likes: likesIds } = location.state || {};
  const [users, setUsers] = useState<Models.Document[]>([]);
  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  useEffect(() => {
    if (likesIds && creators) {
      const likes = likesIds.map((id: string) =>
        creators.documents.find((creator) => creator.$id === id)
      );
      setUsers(likes);
    }
  }, [likesIds, creators]);

  if (isErrorCreators) {
    toast({ title: "Something went wrong." });
    return null; // return null to render nothing in case of error
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {isLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {(users.length > 0 ? users : creators?.documents || []).map(
              (creator: Models.Document) => (
                <li key={creator.$id} className="flex-1 min-w-[200px] w-full">
                  <UserCard user={creator} follow={creator.$id !== user.id} />
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
