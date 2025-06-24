import { VStack, Image, Center, Text, Heading, ScrollView } from "@gluestack-ui/themed";
import { useForm, Controller } from "react-hook-form"

import BackgroundImg from '@assets/background.png';
import Logo from '@assets/logo.svg';

import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { useNavigation } from "@react-navigation/native";
import { AuthNavigationRoutesProps } from '@routes/auth.routes';

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
}

export function SignUp() {

    const { control, handleSubmit } = useForm<FormDataProps>();

    const navigation = useNavigation<AuthNavigationRoutesProps>();

    function handleGoBack() {
        navigation.goBack();
    }

    function handleSignUp({name, email, password, password_confirm}: FormDataProps) {
        console.log({ name, email, password, password_confirm });
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
                            rules={{
                                required: 'Informe o nome'
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    placeholder="Nome"
                                    onChangeText={onChange}
                                    value={value}
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
                                />
                            )}
                        />
                        <Button title="Criar e acessar" onPress={handleSubmit(handleSignUp)} />
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