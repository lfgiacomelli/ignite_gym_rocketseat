import { useEffect, useState } from "react";
import { TouchableOpacity, ScrollView } from "react-native";
import { VStack, Icon, HStack, Heading, Text, Image, Box, useToast } from "@gluestack-ui/themed";

import { ArrowLeft } from "lucide-react-native";

import { Button } from "@components/Button";

import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";


import BodySvg from "@assets/body.svg";
import SeriesSvg from "@assets/series.svg";
import RepetitionSvg from "@assets/repetitions.svg";

import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { ToastMessage } from "@components/ToastMessage";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

type RoutesParamsProps = {
    exerciseId: string;
}

export function Exercise() {
    const [sendingRegister, setSendingRegister] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);
    const toast = useToast();

    const navigation = useNavigation<AppNavigatorRoutesProps>();
    const route = useRoute();

    const { exerciseId } = route.params as RoutesParamsProps;
    function handleGoBack() {
        navigation.goBack();
    }

    async function fetchExerciseDetails() {
        try {
            setIsLoading(true);
            const response = await api.get(`/exercises/${exerciseId}`);
            setExercise(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível carregar os detalhes do exercício.";
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title={title}
                        onClose={() => toast.close(id)}
                    />
                )
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleExerciseHistoryRegister() {
        try {
            setSendingRegister(true);
            await api.post('/history', {exercise_id: exerciseId});
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="success"
                        title="Exercício registrado com sucesso."
                        onClose={() => toast.close(id)}
                    />
                )
            });
            navigation.navigate("history");
        }
        catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível registrar o exercício.";
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        action="error"
                        title={title}
                        onClose={() => toast.close(id)}
                    />
                )
            });
        } finally {
            setSendingRegister(false);
        }
    }

    useEffect(() => {
        fetchExerciseDetails();
    }, [exerciseId]);
    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            <VStack flex={1}>
                <VStack px="$8" bg="$gray600" pt="$12">
                    <TouchableOpacity onPress={handleGoBack}>
                        <Icon as={ArrowLeft} color="$green500" size="xl" />
                    </TouchableOpacity>


                    <HStack justifyContent="space-between" alignItems="center" mt="$4" pb="$8">
                        <Heading color="$gray100" fontFamily="$heading" fontSize="$lg" flexShrink={1}>
                            {exercise.name}
                        </Heading>
                        <HStack alignItems="center">
                            <BodySvg />

                            <Text color="$gray200" ml="$1" textTransform="capitalize">{exercise.group}</Text>
                        </HStack>
                    </HStack>
                </VStack>
                {isLoading ? (
                    <Loading />
                ) : (
                    <VStack p="$8">
                        <Image
                            source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                            alt="Exercício"
                            mb="$3"
                            resizeMode="cover"
                            rounded="$lg"
                            w="$full"
                            h="$80"
                        />

                        <Box bg="$gray600" rounded="$md" pb="$4" px="$4">
                            <HStack alignItems='center' justifyContent="space-around" mb="$6" mt="$5">
                                <HStack>
                                    <Icon as={SeriesSvg} />
                                    <Text color="$gray200" ml="$2">
                                        {exercise.series} séries
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Icon as={RepetitionSvg} />
                                    <Text>
                                        {exercise.repetitions} repetições
                                    </Text>
                                </HStack>
                            </HStack>

                            <Button title="Marcar como finalizado"
                            isLoading={sendingRegister}
                            onPress={handleExerciseHistoryRegister}
                            />
                        </Box>

                    </VStack>
                )}
            </VStack>
        </ScrollView>
    )
}