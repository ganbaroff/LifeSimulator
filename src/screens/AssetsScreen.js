import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useCharacter } from '../context/CharacterContext';
import { AVAILABLE_ASSETS } from '../data/assets';
import { LinearGradient } from 'expo-linear-gradient';

const AssetsScreen = ({ navigation }) => {
  const { character, purchaseAsset, sellOwnedAsset } = useCharacter();

  const handlePurchase = async (assetId) => {
    try {
      await purchaseAsset(assetId);
      Alert.alert('Успех!', 'Актив успешно куплен.');
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const handleSell = async (assetId) => {
    try {
      await sellOwnedAsset(assetId);
      Alert.alert('Успех!', 'Актив успешно продан.');
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0f172a']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Магазин Активов</Text>
            <Text style={styles.balance}>Баланс: ${character.wealth.toLocaleString()}</Text>
          </View>

          <Text style={styles.sectionTitle}>Мои Активы</Text>
          {character.assets && character.assets.length > 0 ? (
            character.assets.map(asset => (
              <View key={asset.id} style={styles.assetCard}>
                <View>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetDescription}>{asset.description}</Text>
                </View>
                <TouchableOpacity style={[styles.button, styles.sellButton]} onPress={() => handleSell(asset.id)}>
                  <Text style={styles.buttonText}>Продать за ${Math.floor(asset.cost * 0.8).toLocaleString()}</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>У вас пока нет активов.</Text>
          )}

          <Text style={styles.sectionTitle}>Доступно для покупки</Text>
          {AVAILABLE_ASSETS.map(asset => {
            const isOwned = character.assets?.some(a => a.id === asset.id);
            const canAfford = character.wealth >= asset.cost;
            return (
              <View key={asset.id} style={[styles.assetCard, isOwned && styles.ownedCard]}>
                <View>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetDescription}>{asset.description}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.button, styles.buyButton, (isOwned || !canAfford) && styles.disabledButton]}
                    onPress={() => handlePurchase(asset.id)}
                    disabled={isOwned || !canAfford}
                >
                  <Text style={styles.buttonText}>{isOwned ? 'Куплено' : `Купить за $${asset.cost.toLocaleString()}`}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 30, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  balance: { fontSize: 20, color: '#22c55e', fontWeight: 'bold' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', marginTop: 20, marginBottom: 15 },
  assetCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ownedCard: { backgroundColor: '#334155' },
  assetName: { fontSize: 18, color: '#f8fafc', fontWeight: '600' },
  assetDescription: { fontSize: 12, color: '#94a3b8', marginTop: 4, flexShrink: 1, marginRight: 10 },
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 20 },
  button: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buyButton: { backgroundColor: '#22c55e' },
  sellButton: { backgroundColor: '#ef4444' },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontWeight: 'bold' },
  backButton: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#1e293b', padding: 15, borderRadius: 12, alignItems: 'center' },
  backButtonText: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold' },
});

export default AssetsScreen;
