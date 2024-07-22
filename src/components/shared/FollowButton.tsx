import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useFollowUser, useGetCurrentUser, useUnfollowUser } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";

const FollowButton = ({ currentUser }: { currentUser: Models.Document }) => {
  const { data: user } = useGetCurrentUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const { mutate: followUserMutation, isPending: isFollowingProcess } = useFollowUser();
  const { mutate: unfollowUserMutation, isPending: isUnFollowingProcess } = useUnfollowUser();

  useEffect(() => {
    if (!currentUser) return;
    const isUserFollowing = user?.following.some((followedUser) => followedUser.followed.$id === currentUser.$id);
    setIsFollowing(isUserFollowing);
  }, []);

  const changeFollow = () => {
    if (isFollowing) {
      const followingRecord = user?.following.find(followedUser => followedUser.followed.$id === currentUser.$id);
      if (followingRecord) {
        unfollowUserMutation(followingRecord.$id);
        setIsFollowing(false);
        return;
      }
    } else {
      followUserMutation({ userId: user?.$id, followingId: currentUser.$id });
      setIsFollowing(true);
    }
  };

  return (
    !isFollowingProcess && !isUnFollowingProcess ? (
      <Button onClick={changeFollow} type="button" className="shad-button_primary px-8">
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
    ) : (
      <Loader />
    )
  );
};

export default FollowButton;
