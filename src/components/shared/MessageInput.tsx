import React from 'react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMessageForm } from '@/hooks/useMessageForm';
import AnimatedSendButton from './AnimatedSendButton';

interface MessageInputProps {
    onSubmit: (content: string) => void;
    disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSubmit, disabled = false }) => {
    const { form, handleSubmit } = useMessageForm(onSubmit);

    return (
    <div className='p-4 bg-dark-2 border-t border-dark-4'>
            <Form {...form}>
                <form onSubmit={handleSubmit} className='flex items-center gap-2'>
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (                    <FormItem className='flex-1'>
                                <FormControl>
                                    <Input 
                                        className='shad-input bg-dark-3 border-dark-4' 
                                        placeholder={disabled ? "Connecting..." : "Type your message..."} 
                                        disabled={disabled}
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <AnimatedSendButton
                        onClick={() => {}}
                        disabled={disabled || !form.watch('content')?.trim()}
                        messageContent={form.watch('content') || ''}
                    />
                </form>
            </Form>
        </div>
    );
};

export default MessageInput;
