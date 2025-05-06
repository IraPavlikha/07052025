import { useState, useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createStackNavigator();

const TaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadsTasks();
  }, []);

  const loadsTasks = async () => {
    const storedTasks = await AsyncStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  };

  const saveTasks = async (newTasks) => {
    await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  const updateTask = (updatedTask) => {
    const updatedTasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
    setTasks(updatedTasks);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newTasks = tasks.filter(task => task.id !== id);
            saveTasks(newTasks);
          }
        }
      ]
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks:</Text>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        {['All', 'Active', 'Completed'].map(option => (
          <TouchableOpacity key={option} onPress={() => setFilter(option)}>
            <Text style={[styles.filterText, filter === option && styles.activeFilter]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show message if no tasks */}
      {filteredTasks.length === 0 && <Text style={styles.noTasksText}>Немає задач</Text>}

      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => (
          <View style={styles.taskItemContainer}>
            <TouchableOpacity
              style={styles.taskItem}
              onPress={() =>
                navigation.navigate('TaskDetails', { task: item, updateTask })
              }
            >
              <Text
                style={[
                  styles.taskText,
                  item.completed && styles.completedTask
                ]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
              <Ionicons
                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.completed ? "#28a745" : "#007bff"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Ionicons name="trash-outline" size={24} color="#ff5c5c" />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTask', { saveTasks, tasks })}
      >
        <Text style={styles.addButtonText}>+ Add New Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const AddTaskScreen = ({ route, navigation }) => {
  const { saveTasks, tasks } = route.params;
  const [taskText, setTaskText] = useState('');

  const addTask = async () => {
    if (!taskText.trim()) {
      alert('Task text cannot be empty');
      return;
    }

    const newTask = {
      id: new Date().toString(),
      text: taskText,
      completed: false
    };

    saveTasks([...tasks, newTask]);
    setTaskText('');  // Clear input field
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add new Task</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Enter your task details here..."
        value={taskText}
        onChangeText={setTaskText}
        multiline
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={addTask}
      >
        <Text style={styles.saveButtonText}>Save Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tasks" component={TaskScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#222222',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#333333',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  taskItem: {
    flex: 1,
    padding: 10,
  },
  taskText: {
    fontSize: 16,
    color: '#ccc',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  addButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#444444',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#333333',
    fontSize: 16,
    marginBottom: 10,
    minHeight: 150,
    color: '#fff',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#666666',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterText: {
    fontSize: 16,
    padding: 5,
    color: '#ccc',
  },
  activeFilter: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  noTasksText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#bbb',
  },
});
