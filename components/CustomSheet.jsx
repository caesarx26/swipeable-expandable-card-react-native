import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import ActionSheet, { ScrollView, SheetManager } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const initialCards = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    title: `Task ${i + 1}`,
    status: ['completed', 'declined', 'in progress'][i % 3],
}));

const CustomSheet = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [cards, setCards] = useState(initialCards);
    const [filter, setFilter] = useState('all');

    const filteredCards = filter === 'all' ? cards : cards.filter(c => c.status === filter);

    const handleGoingHome = () => {
        SheetManager.hide('custom-sheet');
        router.push('/');
    };

    const deleteCard = (id) => {
        setCards(prev => prev.filter(card => card.id !== id));
    };

    return (

        <ActionSheet
            gestureEnabled
            containerStyle={styles.sheet}
            safeAreaInsets={insets}
            backgroundInteractionEnabled
            isModal={false}
            closable={false}
            snapPoints={[50, 100]}
            initialSnapIndex={0}
            headerAlwaysVisible={false}
            drawUnderStatusBar={false}
            disableDragBeyondMinimumSnapPoint
            indicatorStyle={styles.indicator}
            withNestedSheetProvider={false}
        >

            <Pressable style={styles.button} onPress={handleGoingHome}>
                <Text style={styles.filterText}>Go Home</Text>
            </Pressable>
            <View style={styles.header}>
                <Text style={styles.headerText}>Task Status Filter</Text>
                <View style={styles.filterRow}>
                    {['all', 'completed', 'declined', 'in progress'].map(status => (
                        <Pressable
                            key={status}
                            onPress={() => setFilter(status)}
                            style={[
                                styles.filterButton,
                                filter === status && styles.activeFilterButton,
                            ]}
                        >
                            <Text style={styles.filterText}>{status}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <ScrollView style={styles.content}>
                {filteredCards.map(card => (
                    <View key={card.id} style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{card.title}</Text>
                            <Text style={styles.cardStatus}>Status: {card.status}</Text>
                        </View>
                        <Pressable onPress={() => deleteCard(card.id)} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
        </ActionSheet>
    );
};

const styles = StyleSheet.create({
    button: {
        fontSize: 16,
        fontWeight: '500',
        color: '#3b82f6',
        marginBottom: 8,
    },
    indicator: {
        backgroundColor: '#DADCE0',
        height: 5,
        borderRadius: 10,
        width: 50,
    },
    sheet: {
        padding: 16,
        backgroundColor: 'white',
    },
    header: {
        alignItems: 'center',
        paddingBottom: 12,
        borderStartStartRadius: 25,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
    },
    activeFilterButton: {
        backgroundColor: '#3b82f6',
    },
    filterText: {
        color: '#111827',
        fontWeight: '500',
    },
    content: {
        maxHeight: SCREEN_HEIGHT,
        minHeight: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        backgroundColor: '#f9fafb',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardStatus: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 12,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default CustomSheet;
