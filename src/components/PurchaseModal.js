// PurchaseModal.js - Модальное окно для покупок
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import audioService from '../services/AudioService';
import analyticsService from '../services/AnalyticsService';

const CRYSTAL_PACKAGES = [
  { id: 'crystals_50', crystals: 50, price: '$0.99', priceValue: 0.99 },
  { id: 'crystals_150', crystals: 150, price: '$2.99', priceValue: 2.99, popular: true },
  { id: 'crystals_350', crystals: 350, price: '$4.99', priceValue: 4.99 },
  { id: 'crystals_1000', crystals: 1000, price: '$9.99', priceValue: 9.99, bestValue: true },
  { id: 'crystals_3000', crystals: 3000, price: '$24.99', priceValue: 24.99 },
];

const PurchaseModal = ({ visible, onClose, onPurchase }) => {
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (package_) => {
    if (purchasing) return;

    setPurchasing(true);
    await audioService.playSoundEffect('button_click', true);

    // TODO: Интегрировать реальный Adapty SDK
    // Сейчас это mock
    Alert.alert('Purchase', `Purchase ${package_.crystals} crystals for ${package_.price}?`, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => setPurchasing(false),
      },
      {
        text: 'Buy',
        onPress: async () => {
          // Симуляция покупки
          await analyticsService.logPurchase(package_.id, package_.priceValue, 'USD');

          if (onPurchase) {
            onPurchase(package_.crystals);
          }

          await audioService.playSoundEffect('purchase', true);
          Alert.alert('Success!', `You received ${package_.crystals} crystals!`);
          setPurchasing(false);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.gradient}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>💎 Crystal Shop</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Packages */}
            <ScrollView style={styles.packagesContainer}>
              {CRYSTAL_PACKAGES.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.package,
                    pkg.popular && styles.packagePopular,
                    pkg.bestValue && styles.packageBestValue,
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchasing}
                >
                  {pkg.popular && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>POPULAR</Text>
                    </View>
                  )}
                  {pkg.bestValue && (
                    <View style={[styles.badge, styles.badgeBestValue]}>
                      <Text style={styles.badgeText}>BEST VALUE</Text>
                    </View>
                  )}

                  <View style={styles.packageContent}>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageCrystals}>{pkg.crystals} 💎</Text>
                      <Text style={styles.packagePrice}>{pkg.price}</Text>
                    </View>
                    <View style={styles.buyButton}>
                      <Text style={styles.buyButtonText}>BUY</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Purchases are processed securely through your app store
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#94a3b8',
  },
  packagesContainer: {
    flex: 1,
    padding: 20,
  },
  package: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packagePopular: {
    borderColor: '#8b5cf6',
  },
  packageBestValue: {
    borderColor: '#fbbf24',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeBestValue: {
    backgroundColor: '#fbbf24',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  packageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageInfo: {
    flex: 1,
  },
  packageCrystals: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 18,
    color: '#94a3b8',
  },
  buyButton: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default PurchaseModal;
