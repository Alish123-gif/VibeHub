import { useRef, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { chatValidationSchema } from '@/lib/validation';

export const useMessageForm = (onSubmit: (content: string) => void) => {
    const form = useForm<z.infer<typeof chatValidationSchema>>({
        resolver: zodResolver(chatValidationSchema),
        defaultValues: {
            content: ""
        }
    });

    const handleSubmit = (data: z.infer<typeof chatValidationSchema>) => {
        if (!data.content.trim()) return;
        onSubmit(data.content);
        form.reset();
    };

    return {
        form,
        handleSubmit: form.handleSubmit(handleSubmit),
        isValid: !!form.watch('content')?.trim()
    };
};
