import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS, SHADOWS } from './src/theme/theme';

import { BottomNav } from './src/components/BottomNav';
import { TopWave, BottomWave } from './src/components/DesignFrame';

import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [targetService, setTargetService] = useState(null);

  if (!user) {
    return <AuthScreen />;
  }

  const handleNavigateService = (serviceId) => {
    if (serviceId === 'all') {
      setTargetService(null);
    } else {
      setTargetService(serviceId);
    }
    setActiveTab('services');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateService={handleNavigateService}
            onOpenNotice={() => {
              setTargetService('notices');
              setActiveTab('services');
            }}
            onOpenAssignment={() => {
              setTargetService('assignments');
              setActiveTab('services');
            }}
          />
        );
      case 'services':
        return (
          <View style={styles.tabWrapper}>
            <TopWave showPlus={false} />
            <View style={styles.tabBody}>
              <ServicesScreen
                initialService={targetService}
                onResetInitial={() => setTargetService(null)}
              />
            </View>
            <BottomWave />
          </View>
        );
      case 'notifications':
        return (
          <View style={styles.tabWrapper}>
            <TopWave showPlus={false} />
            <View style={styles.tabBody}>
              <NotificationsScreen />
            </View>
            <BottomWave />
          </View>
        );
      case 'profile':
        return (
          <View style={styles.tabWrapper}>
            <TopWave showPlus={false} />
            <View style={styles.tabBody}>
              <ProfileScreen />
            </View>
            <BottomWave />
          </View>
        );
      default:
        return <HomeScreen onNavigateService={handleNavigateService} />;
    }
  };

  // If home screen, HomeScreen already manages its outer phone container
  if (activeTab === 'home') {
    return (
      <View style={styles.outerCanvas}>
        <StatusBar barStyle="light-content" backgroundColor="#1D3BB9" />
        <View style={styles.phoneContainer}>
          <View style={styles.body}>{renderActiveScreen()}</View>
          <BottomNav
            activeTab={activeTab}
            onTabSelect={(tab) => {
              if (tab === 'services' && activeTab !== 'services') {
                setTargetService(null);
              }
              setActiveTab(tab);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerCanvas}>
      <StatusBar barStyle="light-content" backgroundColor="#1D3BB9" />
      <View style={styles.phoneContainer}>
        <View style={styles.body}>{renderActiveScreen()}</View>
        <BottomNav
          activeTab={activeTab}
          onTabSelect={(tab) => {
            if (tab === 'services' && activeTab !== 'services') {
              setTargetService(null);
            }
            setActiveTab(tab);
          }}
        />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  outerCanvas: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  phoneContainer: {
    width: '100%',
    maxWidth: 400,
    height: '96%',
    maxHeight: 740,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.glow,
  },
  body: {
    flex: 1,
  },
  tabWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  tabBody: {
    flex: 1,
  },
});
