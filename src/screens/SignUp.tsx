import { useState } from "react";
import { VStack, Image, Center, Text, Heading, ScrollView, useToast } from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup';

import { api } from '@services/api';

import BackgroundImg from '@assets/background.png';
import Logo from '@assets/logo.svg';

import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { AppError } from "@utils/AppError";

import { useNavigation } from "@react-navigation/native";
import { AuthNavigationRoutesProps } from '@routes/auth.routes';
import { ToastMessage } from "@components/ToastMessage";
import { useAuth } from "@hooks/useAuth";

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
}

const signUpSchema = yup.object({
    name: yup.string().required('Informe o nome.'),
    email: yup.string().required('Informe o e-mail.').email('E-mail inválido.'),
    password: yup.string().required('Informe a senha.').min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    password_confirm: yup.string().required('Confirme a senha.').oneOf([yup.ref("password"), ""], "As senhas não conferem.")
});

export function SignUp() {
    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();

    const { signIn } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema)
    });

    const navigation = useNavigation<AuthNavigationRoutesProps>();

    function handleGoBack() {
        navigation.goBack();
    }

    async function handleSignUp({ name, email, password }: FormDataProps) {
        try {
            setIsLoading(true);
            await api.post('/users', { name, email, password });
            await signIn(email, password);
        } catch (error) {
            setIsLoading(false);

            const isAppError = error instanceof AppError;
            
            const errorMessage = isAppError
                ? error.message
                : 'Erro inesperado. Tente novamente mais tarde.';

            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title="Erro"
                        description={errorMessage}
                        onClose={() => toast.close(id)}
                    />
                ),
            });
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <VStack flex={1} bg="$gray700" >
                <Image
                    w="$full"
                    h={624}
                    defaultSource={BackgroundImg}
                    source={BackgroundImg}
                    position="absolute"
                    alt="Pessoas treinando"
                />
                <VStack flex={1} px="$10" pb="$16">
                    <Center my="$24">
                        <Logo />

                        <Text color="$gray100" fontSize="$sm">
                            Treine sua mente e o seu corpo.
                        </Text>
                    </Center>

                    <Center gap="$2" flex={1}>
                        <Heading color="$gray100">
                            Crie sua conta
                        </Heading>
                        <Controller control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Nome"
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.name?.message}
                                />
                            )}
                        />
                        <Controller control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="E-mail"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.email?.message}
                                />)}
                        />
                        <Controller control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Senha"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.password?.message}
                                />)}
                        />
                        <Controller control={control}
                            name="password_confirm"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Confirme a senha"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onChangeText={onChange}
                                    value={value}
                                    onSubmitEditing={handleSubmit(handleSignUp)}
                                    returnKeyType="send"
                                    errorMessage={errors.password_confirm?.message}
                                />
                            )}
                        />
                        <Button title="Criar e acessar" isLoading={isLoading} onPress={handleSubmit(handleSignUp)} />
                    </Center>

                    <Button
                        title="Voltar para o login"
                        variant="outline" mt="$12"
                        onPress={handleGoBack}
                    />
                </VStack>
            </VStack>
        </ScrollView>
    );
}