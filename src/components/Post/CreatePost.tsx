import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import storageService from '../../app/services/storageService';
import databaseService from '../../app/services/databaseService';
import { Button, ErrorMessage, Input, Loader } from '../index';
import { AuthState } from '../../interfaces';
import { UploadPostType } from '../../app/interfaces/interfaces';

interface CreatePostProps {
    setCreatePost: (setVal: boolean) => void,
    previousPost?: {
        title: string,
        content: string,
    }
}

export interface FormData {
    title: string,
    content: string,
    slug: string,
    featuredImage: FileList,
}

const CreatePost: React.FC<CreatePostProps> = ({ setCreatePost, previousPost }) => {

    const userData = useSelector((state: AuthState) => state.auth.userData);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<UploadPostType>({defaultValues: {
        title: previousPost?.title,
        content: previousPost?.content,
    }});

    // State for slug.
    const [slug, setSlug] = useState("");

    // State to store the selected image file name.
    const [fileName, setFileName] = useState('');

    // Function to handle image file input.
    const handleImageFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files.length > 0) {
            // Get the selected image file.
            const file = e.target.files[0];
            const imageSize = file.size / 1024 / 1024;

            // Check if the image size is less than 2MB, if it is, then set error.
            if (imageSize > 2) {
                setError('featuredImage', {
                    type: 'manual',
                    message: 'Image should be less than 2MB',
                });
                setFileName('');
            } else {
                setFileName(file.name)
            }
        } else {
            setFileName('');
        }
    };

    // Function to handle slug and keep it unique.
    const handleSlug = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        let slug = e.target.value;

        slug = slug
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z\d\s]+/g, "-")
            .replace(/\s/g, "-");
        setSlug(slug);
    }, []);

    const handlePostSubmit: SubmitHandler<UploadPostType> = async (data) => {

        let userPostCount: number = 0;

        // Getting total post count of user.
        try {
            userPostCount = await databaseService.getUserPostCount(data.title);
        } catch (error) {
            console.log(error);
        }

        // Creating final unique slug for post.
        const finalSlug: string = `${slug}-${userPostCount}`;
        let uploadedImageFile = null;

        // If user has selected any image, then upload it.
        if (data.featuredImage && data.featuredImage[0]) {
            try {
                uploadedImageFile = await storageService.uploadFile(data.featuredImage[0]);
            } catch (error) {
                console.log(error);
            }
        }

        // Upload post.
        try {
            const featuredImageId = uploadedImageFile?.$id;
            const post = await databaseService.createPost({
                title: data.title,
                content: data.content,
                featuredImage: featuredImageId,
                slug: finalSlug,
                userId: userData.$id,
            });

            if (post) {
                setCreatePost(false);
                navigate(`/post/${post.$id}`);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div
            className="absolute top-0 left-0 min-h-screen w-screen mx-auto flex items-center justify-center bg-black bg-opacity-25 z-[60]"
        >
            {isSubmitting && <Loader />}
            <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="bg-[#0f2138] p-4 mx-auto w-[600px] max-w-[90vw] rounded-xl">

                <Button
                    className={'w-fit p-0 flex items-center justify-center ml-auto !bg-transparent hover:text-slate-500'}
                    type='button'
                    onClick={() => setCreatePost(false)}
                >
                    <CloseIcon />
                </Button>

                <form
                    onSubmit={handleSubmit(handlePostSubmit)}
                    className="w-fit mx-auto"
                >
                    <Input
                        label="Title"
                        error={errors.title}
                        type="text"
                        placeholder="Enter post title"
                        {...register('title', {
                            required: "Title is required",
                            minLength: {
                                value: 3,
                                message: "Atleast 3 characters required"
                            },
                            validate: (value) => {
                                if (value.length < 3) return "Atleast 3 characters required"
                                return true;
                            },
                            onChange: handleSlug
                        })}
                    />

                    <div className="max-w-[90vw] mx-4 my-4 flex flex-col gap-2" >
                        <div
                            className="flex flex-row justify-between items-center"
                        >
                            <label
                                htmlFor="content"
                                className="text-sm sm:text-lg"
                            >
                                Write Something
                            </label>
                            {errors.content && (
                                <ErrorMessage message={errors.content?.message || ""} />
                            )}
                        </div>

                        <textarea
                            id="content"
                            className="max-w-full min-h-32 w-96 bg-transparent border border-[#cbd5e16E] rounded-l-md py-1 px-4 focus:border-white focus:outline-none"
                            {...register('content', {
                                required: "Content is required",
                                minLength: {
                                    value: 100,
                                    message: "Atleast 100 characters required"
                                },
                                validate: (value) => {
                                    if (Number(value) < 100) return "Atleast 100 characters required*"
                                    return true;
                                }
                            })}
                        />
                    </div>

                    <div className="flex flex-row items-center justify-start gap-2 max-w-full">
                        <Input
                            type="file"
                            label="Select Image"
                            error={errors.featuredImage}
                            labelclasses="cursor-pointer bg-purple-600 px-3 py-1 rounded-md hover:opacity-70 duration-500"
                            className="hidden"
                            accept="image/png, image/jpg, image/jpeg, image/gif"
                            multiple={false}
                            {...register('featuredImage', {
                                required: false,
                                onChange: handleImageFileInput
                            })}
                        />
                        <span className="max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis block">{fileName}</span>
                    </div>

                    <Button
                        type='submit'
                        bgColor='bg-yellow-300'
                        textColor='text-gray-900'
                    >
                        {
                            previousPost ? "Update Post" : "Create Post"
                        }
                    </Button>

                </form>
            </motion.div>
        </div>
    );
};

export default CreatePost;
