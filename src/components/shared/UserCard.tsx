import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import FollowButton from "./FollowButton";

type UserCardProps = {
  user: Models.Document;
  follow: boolean;
};

const UserCard = ({ user, follow }: UserCardProps) => {
  return (
    <div className="user-card">
      <Link to={`/profile/${user.$id}`} className="flex-center flex-col gap-4">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-14 h-14 mx-auto"
        />

        <div className="flex-center flex-col gap-1">
          <p className="base-medium text-light-1 text-center line-clamp-1">
            {user.name}
          </p>
          <p className="small-regular text-light-3 text-center line-clamp-1">
            @{user.username}
          </p>
        </div>
      </Link>
      {follow ? <FollowButton currentUser={user} /> : ""}
    </div>
  );
};

export default UserCard;