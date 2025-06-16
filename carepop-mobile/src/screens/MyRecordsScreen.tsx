import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert, SafeAreaView } from 'react-native';
import { getMyRecords, MedicalRecord, getRecordSignedUrl } from '../utils/api';
import { format } from 'date-fns';
import { theme } from '../components';
import * as Linking from 'expo-linking';

export function MyRecordsScreen() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setLoading(true);
                const fetchedRecords = await getMyRecords();
                setRecords(fetchedRecords);
                setError(null);
            } catch (e) {
                setError('Failed to fetch medical records. Please try again later.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const handleViewRecord = async (recordId: string) => {
        try {
            const { signedUrl } = await getRecordSignedUrl(recordId);
            // Open the signed URL in the device's browser
            await Linking.openURL(signedUrl);
        } catch (err) {
            Alert.alert('Error', 'Could not open the record. Please try again.');
            console.error('Failed to get or open signed URL', err);
        }
    };

    const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
        <View style={styles.recordItemContainer}>
            <View style={styles.recordInfo}>
                <Text style={styles.recordType}>{item.record_type}</Text>
                <Text style={styles.recordDate}>
                    Uploaded on: {format(new Date(item.created_at), 'MMMM d, yyyy')}
                </Text>
                 <Text style={styles.recordDescription} numberOfLines={1}>
                    {item.description || 'No description'}
                </Text>
            </View>
            <Pressable style={styles.viewButton} onPress={() => handleViewRecord(item.id)}>
                <Text style={styles.viewButtonText}>View</Text>
            </Pressable>
        </View>
    );

    const ListContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centered} />;
        }

        if (error) {
            return <Text style={styles.errorText}>{error}</Text>;
        }

        if (records.length === 0) {
            return <Text style={styles.emptyText}>You have no medical records.</Text>;
        }

        return (
            <FlatList
                data={records}
                renderItem={renderRecordItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
            />
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>My Records</Text>
                <ListContent />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        padding: theme.spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.sm,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'red',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
    listContentContainer: {
        paddingBottom: 20,
    },
    recordItemContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    recordInfo: {
        flex: 1,
        marginRight: 10,
    },
    recordType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    recordDate: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },
    recordDescription: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
        fontStyle: 'italic',
    },
    viewButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    viewButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
