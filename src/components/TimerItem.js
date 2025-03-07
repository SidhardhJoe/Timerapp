import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Progress from "react-native-progress";
import Modal from "react-native-modal";

export default function TimerItem({ timer, updateTimer }) {
  const [remaining, setRemaining] = useState(timer.remaining);
  const [running, setRunning] = useState(timer.running);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let interval;
    if (running && remaining > 0) {
      interval = setInterval(() => {
        setRemaining((prev) => prev - 1);
      }, 1000);
    } else if (remaining === 0 && running) {
      clearInterval(interval);
      handleCompletion();
    }
    return () => clearInterval(interval);
  }, [running, remaining]);

  const handleCompletion = async () => {
    setRunning(false);
    setShowModal(true);

    const completedTimer = {
      id: timer.id,
      name: timer.name,
      time: new Date().toLocaleString(),
    };

    try {
      const history = await AsyncStorage.getItem("history");
      const historyList = history ? JSON.parse(history) : [];
      historyList.push(completedTimer);
      await AsyncStorage.setItem("history", JSON.stringify(historyList));
    } catch (error) {
      console.error("Error saving to history:", error);
    }

    updateTimer({ ...timer, remaining: 0, running: false });
  };

  return (
    <SafeAreaView style={styles.timer}>
      <View style={styles.topview}>
        <Text style={styles.timerText}>{timer.name}</Text>
      </View>
      <Text style={styles.timerText}>{remaining}s</Text>

      <Progress.Bar
        progress={remaining / timer.duration}
        width={230}
        color="blue"
        style={styles.progressBar}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => setRunning(!running)}
          style={styles.startbutton}
        >
          <View>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {running ? "Pause" : "Start"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setRemaining(timer.duration);
            updateTimer({
              ...timer,
              remaining: timer.duration,
              running: false,
            });
          }}
          style={styles.resetbutton}
        >
          <View>
            <Text style={{ color: "white", fontWeight: "bold" }}>Reset</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal isVisible={showModal} onBackdropPress={() => setShowModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>🎉 {timer.name} Completed!</Text>
          <Button title="OK" onPress={() => setShowModal(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  timer: {
    padding: 15,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 5,
    marginBottom: 5,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  progressBar: {
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "space-between",
  },
  resetbutton: {
    height: 40,
    width: 70,
    backgroundColor: "#AA0000",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  startbutton: {
    height: 40,
    width: 70,
    backgroundColor: "#355E3B",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  topview: {
    width: "100%",
  },
});
