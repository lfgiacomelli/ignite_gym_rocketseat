import { useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { Center, Heading, Text, VStack, set, useToast } from "@gluestack-ui/themed";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';

import { Controller, useForm } from "react-hook-form";

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { ToastMessage } from "@components/ToastMessage";
import { useAuth } from "@hooks/useAuth";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

import defaultUserPhoto from "@assets/userPhotoDefault.png";




type FormDataProps = {
    name: string;
    email: string;
    password: string;
    old_password: string;
    password_confirm: string;
};


const profileSchema = yup.object({
    name: yup.string().required('Informe o nome'),
    email: yup.string().email('E-mail inválido').required('Informe o e-mail'),
    old_password: yup.string().nullable().transform((value) => (!!value ? value : null)),
    password: yup
        .string()
        .min(6, 'A senha deve ter pelo menos 6 dígitos.')
        .nullable()
        .transform((value) => (!!value ? value : null)),
    password_confirm: yup
        .string()
        .nullable()
        .transform((value) => (!!value ? value : null))
        .oneOf([yup.ref('password'), null], 'As senhas devem ser iguais.')
        .when('password', {
            is: (Field: any) => Field,
            then: (schema) =>
                schema.nullable().required('Informe a confirmação da senha.'),
        }),
})

export function Profile() {
    const [isUpdating, setIsUpdating] = useState(false);

    const toast = useToast();
    const { user, updateUserProfile } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email
        },
        resolver: yupResolver(profileSchema)
    });

    async function handleUserPhotoSelect() {
        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
                base64: true,
            });
            if (photoSelected.canceled) {
                return;
            }

            const photoUri = photoSelected.assets[0].uri

            if (photoUri) {
                const photoInfo = (await FileSystem.getInfoAsync(photoUri)) as {
                    size: number;
                };

                if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 5) {
                    return toast.show({
                        placement: "top",
                        render: ({ id }) => (
                            <ToastMessage
                                id={id}
                                action="error"
                                title="Imagem muito grande"
                                description="Escolha uma imagem de até 5MB."
                                onClose={() => toast.close(id)}
                            />
                        )
                    })
                }

                const fileExtension = photoSelected.assets[0].uri.split('.').pop();

                const photoFile = {
                    name: `${user.name}.${fileExtension}`.toLowerCase(),
                    uri: photoSelected.assets[0].uri,
                    type: `${photoSelected.assets[0].type}/${fileExtension}`
                } as any;

                const userPhotoUploadForm = new FormData();
                userPhotoUploadForm.append('avatar', photoFile);

                const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                const userUpdated = user;
                userUpdated.avatar = avatarUpdatedResponse.data.avatar;

                await updateUserProfile(userUpdated);

                toast.show({
                    placement: "top",
                    render: ({ id }) => (
                        <ToastMessage
                            id={id}
                            action="success"
                            title="Foto de perfil atualizada"
                            description="Sua foto de perfil foi atualizada com sucesso."
                            onClose={() => toast.close(id)}
                        />
                    )
                });
                console.log(userUpdated);
            }
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível atualizar a foto de perfil.';

            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title={title}
                        description="Tente novamente mais tarde."
                        onClose={() => toast.close(id)}
                    />
                )
            })
            console.error(error);
        }
    }

    async function handleProfileUpdate(data: FormDataProps) {
        try {
            setIsUpdating(true);

            const userUpdated = user;
            userUpdated.name = data.name;

            await api.put('/users', data);

            await updateUserProfile(userUpdated);

            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="success"
                        title="Perfil atualizado"
                        description="As informações do seu perfil foram atualizadas com sucesso."
                        onClose={() => toast.close(id)}
                    />
                )
            })
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível atualizar o perfil. Tente novamente mais tarde.';

            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title={title}
                        description="As informações do seu perfil não puderam ser atualizadas."
                        onClose={() => toast.close(id)}
                    />
                )
            })
        }
        finally {
            setIsUpdating(false);
        }
    }

    return (

        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt="$6" px="$10">
                    <UserPhoto source={user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : defaultUserPhoto}
                        alt="Foto de perfil do usuário"
                        size="xl"
                    />

                    <TouchableOpacity onPress={handleUserPhotoSelect}>
                        <Text
                            color="$green500"
                            fontFamily="$heading"
                            fontSize="$md"
                            mt="$2"
                            mb="$8"
                        >
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Center w="$full" gap="$4">
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Nome"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.name?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="E-mail"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    value={value}
                                    isReadOnly
                                />
                            )}
                        />

                    </Center>
                    <Heading
                        alignSelf="flex-start"
                        fontFamily="$heading"
                        color="$gray200"
                        fontSize="$md"
                        mt="$12"
                        mb="$2"
                    >
                        Alterar senha
                    </Heading>

                    <Center w='$full' gap="$4">
                        <Controller
                            control={control}
                            name="old_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Senha antiga"
                                    bg="$gray600"
                                    secureTextEntry
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Nova senha"
                                    bg="$gray600"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    errorMessage={errors.password?.message}
                                />

                            )}
                        />
                        <Controller
                            control={control}
                            name="password_confirm"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Confirme a nova senha"
                                    bg="$gray600"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    errorMessage={errors.password_confirm?.message}

                                />

                            )}
                        />
                        <Button
                            title="Atualizar"
                            onPress={handleSubmit(handleProfileUpdate)}
                            isLoading={isUpdating}
                        />
                    </Center>
                </Center>
            </ScrollView>
        </VStack>
    )
}