import { useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { Center, Heading, Text, VStack, useToast } from "@gluestack-ui/themed";
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



type FormDataProps = {
    name: string;
    email: string;
    password: string;
    old_password: string;
    password_confirm: string;
};


const profileSchema = yup.object({
    name: yup.string().required('Informe o nome'),
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
    const [userPhoto, setUserPhoto] = useState("https://github.com/lfgiacomelli.png");

    const toast = useToast();
    const { user } = useAuth();

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

                setUserPhoto(photoUri);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function handleProfileUpdate(data: FormDataProps) {
        console.log(data);
    }

    return (

        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt="$6" px="$10">
                    <UserPhoto source={{ uri: userPhoto }}
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
                        />
                    </Center>
                </Center>
            </ScrollView>
        </VStack>
    )
}