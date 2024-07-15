import { useCommentOnPost, useDeleteComment, useGetComments } from '@/lib/react-query/queriesAndMutations';
import Loader from './Loader';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { commentValidationSchema } from '@/lib/validation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { useUserContext } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';
import { timeAgo } from '@/lib/utils';

const PostComments = ({ postId }: { postId: string }) => {
    const { data: comments, isPending: isCommentLoading } = useGetComments(postId);
    const { user } = useUserContext();
    const { id } = useParams();
    const { mutate: commentOnPost } = useCommentOnPost();
    const { mutate: deleteComment } = useDeleteComment();
    const form = useForm<z.infer<typeof commentValidationSchema>>({
        resolver: zodResolver(commentValidationSchema),
        defaultValues: {
            comment: "",
        },
    })
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const values = form.getValues();
        commentOnPost({ postId, comment: values.comment, userId: user.id })
        form.reset();
    }
    const onDelete = (commentId: string) => {
        console.log(commentId)
        deleteComment(commentId);
    }

    if (isCommentLoading) return <Loader />;
    return (
        <div className='w-full'>
            <Form {...form}>
                <form onSubmit={onSubmit} className="flex flex-col gap-9 w-full max-w-5xl">
                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="text" className="bg-transparent mb-4 border-light-3" {...field} placeholder='Write a new comment' />
                                </FormControl>
                                <FormMessage className="shad-form_message" />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <h5 className='mb-2 base-medium'>Comments</h5>
            {comments?.documents.length === 0 && <p className='text-light-4 text-center'>Be the first to comment</p>}
            {comments?.documents.map((comment) => (
                <div key={comment.$id} className="flex justify-between gap-2 my-4 w-full transition-all">
                    <div className="flex gap-2">
                        <img
                            src={comment.user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                            alt="Creator"
                            className="rounded-full sm:w-6 sm:h-6 w-8 h-8 flex mt-1" />
                        <div>
                            <p className="text-light-4 sm:small-medium tiny-medium ">{comment.user.name} - {timeAgo(comment.$createdAt)}</p>
                            <p className="text-light-1">{comment.content}</p>
                        </div>
                    </div>
                    {user.id === comment.user.$id && (
                        <img
                            className="self-center cursor-pointer"
                            onClick={() => onDelete(comment.$id)}
                            src="/assets/icons/delete.svg"
                            alt="delete"
                            width={16}
                            height={16}
                        />
                    )}
                </div>
            ))}

        </div>
    )
}

export default PostComments