import { Center, HStack, Text, VStack } from "@gluestack-ui/themed";

import { HomeHeader } from "@components/HomeHeader";
import { Group } from "@components/Group";
import { useState } from "react";
import { FlatList } from "react-native";

export function Home() {
    const [groups, setGroups] = useState(["costa", "ombro", "perna", "peito", "triceps", "biceps"]);
    const [groupSelected, setGroupSelected] = useState("costa");
    return (
        <VStack flex={1}>
            <HomeHeader />
            <FlatList
                data={groups}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Group
                        name={item}
                        isActive={item === groupSelected}
                        onPress={() => setGroupSelected(item)}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 32 }}
                style={{ marginVertical: 40, maxHeight: 44, minHeight: 44 }}
            />
        </VStack>
    )
}