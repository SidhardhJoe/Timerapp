import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput, StyleSheet, TouchableOpacity, SectionList, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimerItem from '../components/TimerItem';

export default function HomeScreen({ navigation }) {
  const [timers, setTimers] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');


  useEffect(() => {
    async function fetchTimers() {
      const savedTimers = await AsyncStorage.getItem('timers');
      if (savedTimers) {
        setTimers(JSON.parse(savedTimers)); 
      }
    }
    fetchTimers();
  }, []);

  const saveTimers = async (timersToSave) => {
    await AsyncStorage.setItem('timers', JSON.stringify(timersToSave));
  };

  const addTimer = () => {
    if (!name || !duration || !category) return;
  
    const newTimer = {
      id: Date.now(),
      name,  
      duration: parseInt(duration),
      category,
      remaining: parseInt(duration),
      running: false
    };
  
    
    const updatedTimers = [...timers, newTimer];
    setTimers(updatedTimers);
    saveTimers(updatedTimers);
  
    
    setName('');
    setDuration('');
    setCategory('');
  };
  
  const updateTimer = (updatedTimer) => {
   
    const updatedList = timers.map(timer =>
      timer.id === updatedTimer.id ? updatedTimer : timer
    );
  
    setTimers(updatedList);
    saveTimers(updatedList);
  };
  
  const groupedTimers = timers.reduce((acc, timer) => {
    if (!acc[timer.category]) {
      acc[timer.category] = [];
    }
    acc[timer.category].push(timer);
    return acc;
  }, {});
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Timer</Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Duration (seconds)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />
      <Button title="Add Timer" onPress={addTimer} />

      <Text style={styles.title}>Timers</Text>
      <SectionList
      showsVerticalScrollIndicator={false}
        sections={Object.entries(groupedTimers).map(([key, value]) => ({
          title: key,
          data: value
        }))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TimerItem timer={item} updateTimer={updateTimer} />
        )}
        renderSectionHeader={({ section }) => (
         
            <Text style={styles.categoryHeader}>{section.title}</Text>
         
          
        )}
      />

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyText}>View History</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor:"white"
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius:5
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    backgroundColor: 'black',
    padding: 5,
    color:"white"
  },
  historyButton: {
    marginTop: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  historyText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
