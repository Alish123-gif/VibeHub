import Loader from '@/components/shared/Loader'
import PostStats from '@/components/shared/PostStats'
import { Button } from '@/components/ui/button'
import { useUserContext } from '@/context/AuthContext'
import { useDeletePost, useGetPostById } from '@/lib/react-query/queriesAndMutations'
import { timeAgo } from '@/lib/utils'
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const PostDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate();
    const { data: post, isPending } = useGetPostById(id || " ");
    const { mutate: deletePost } = useDeletePost();
    const handleDeletePost = () => {
        deletePost({ postId: id||"", imageId: post?.imageId });
        navigate(-1);
    };
    const { user } = useUserContext();
    return (
        <div className='post_details-container'>
            {isPending ? <Loader />
                : <div className='post_details-card'>
                    <img src={post?.imageUrl} alt="post" className='post_details-img' />
                    <div className="post_details-info">
                        <div className='flex-between w-full'>
                            <Link to={`/profile/${post?.creator.$id}`} className='flex items-center gap-3'>
                                <img
                                    src={post?.creator.imageUrl ||
                                        '/assets/icons/profile-placeholder.svg'}
                                    alt="Creator"
                                    className="rounded-full w-8 lg:w-12" />

                                <div className="flex flex-col">
                                    <p className="base-medium lg:body-bold text-light-1">
                                        {post?.creator.name}
                                    </p>
                                    <div className="flex-center gap-2 text-light-3">
                                        <p className="subtle-semibold lg:small-regular">{timeAgo(post?.$createdAt || "")} - {post?.location}</p>


                                    </div>

                                </div>
                            </Link>
                            <div className='flex-center gap-1'>
                                {user.id === post?.creator.$id &&
                                    <>
                                        <Link to={`/update-post/${post?.$id}`}>
                                            <img src="/assets/icons/edit.svg" alt="edit" width={24} height={24} />
                                        </Link>
                                        <Button
                                            onClick={handleDeletePost}
                                            variant='ghost'
                                            className='ghost_details-delete_btn'>

                                            <img src="/assets/icons/delete.svg" alt="delete" width={24} height={24} />
                                        </Button>
                                    </>
                                }
                            </div>
                        </div>
                        <hr className='border w-full border-dark-4/80' />
                        <div className="small-medium lg:base-medium py-5">
                            <p>
                                {post?.caption}
                            </p>
                            <ul className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                                {post?.tags.length > 1
                                    ?
                                    post?.tags.map((tag: string) => (
                                        <li key={tag} className="text-light-3">
                                            #{tag}
                                        </li>
                                    ))
                                    :
                                    null
                                }
                            </ul>
                        </div>

                        <div className='w-full'>
                            <PostStats post={post || {}} userId={user.id} />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default PostDetails