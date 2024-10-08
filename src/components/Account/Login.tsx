import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from '../../app/store/features/authSlice';
import authService from '../../app/services/authService';
import LoginIcon from '@mui/icons-material/Login';
import { Button, Input, Loader } from '../../components/index';
import { useState } from 'react';

export interface FormData {
    email: string,
    password: string,
}

export default function Login() {

    // Navigate and dispatch functions.
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // State for appwrite service error.
    const [appwriteError, setAppwriteError] = useState<string | null>(null);

    // Getting register and handleSubmit function from useForm.
    const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>();

    // Function to handle login.
    const handleLogin = async (data: FormData) => {

        try {
            // Try to create a new session by login the user.
            const session = await authService.login(data);

            // If session created successfully, update it in store.
            if (session) dispatch(login({ userData: session }));

            // Set loading false, and navigate home page.
            navigate('home');
        } catch (error) {
            setAppwriteError((error as Error).message || 'An unexpected error occurred');
        }
    };

    return (
        <div
            className="min-h-[80vh] w-screen mx-auto my-4 flex items-center justify-center relative"
        >
            {isSubmitting && <Loader />}
            <div className="bg-[#cbd5e11a] p-4 mx-auto w-[600px] max-w-[90vw] rounded-xl">
                <h2 className="text-xl font-semibold flex items-center justify-center w-fit gap-2">
                    <LoginIcon />
                    Sign In
                </h2>

                <form onSubmit={handleSubmit(handleLogin)} className="mt-7 w-fit mx-auto">

                    {
                        appwriteError && <p className="text-red-500 my-2">
                            {appwriteError}*
                        </p>
                    }

                    <Input
                        label="Email:"
                        placeholder="Enter your email"
                        type="email"
                        error={errors.email}
                        {...register('email', {
                            required: "Email is required",
                        })}
                    />

                    <Input
                        label="Password:"
                        placeholder="Enter your password"
                        type="password"
                        error={errors.password}
                        {...register('password', {
                            required: "Password is required",
                        })}
                    />

                    <Button
                        type="submit"
                    >
                        Sign In
                    </Button>
                </form>

                <p className="flex gap-1 w-fit mx-auto my-5">
                    Don't have account?
                    <Link
                        to='/signup'
                        className="text-sky-400 hover:underline underline-offset-4"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};
