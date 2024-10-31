import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

const COLORS = ['#e74c3c', '#8e44ad', '#3498db', '#27ae60', '#f1c40f', '#d35400', '#2c3e50', '#95a5a6'];

interface Area {
  name: string;
  points: { latitude: number; longitude: number }[];
  color: string;
}

const App: React.FC = () => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [area, setArea] = useState<{ start: { latitude: number; longitude: number } | null; points: { latitude: number; longitude: number }[]; name: string; color: string }>({
    start: null,
    points: [],
    name: '',
    color: COLORS[0],
  });
  const [areas, setAreas] = useState<Area[]>([]);
  const [manualMode, setManualMode] = useState(false);

  type Coordinate = { latitude: number; longitude: number };

  const handleDrawArea = useCallback(() => {
    setDrawingMode((prev) => !prev);
  }, []);

  const updateAreaPoints = useCallback((newPoints: Coordinate[]) => {
    setArea((prev) => ({ ...prev, points: newPoints }));
  }, []);

  const handleMarkerPress = useCallback((index: number) => {
    if (drawingMode && index !== 0) {
      const newAreaPoints = area.points.filter((_, i) => i !== index);
      updateAreaPoints(newAreaPoints);
    }
  }, [drawingMode, area.points, updateAreaPoints]);

  const handleMarkerDrag = useCallback((coordinate: Coordinate, index: number) => {
    if (!drawingMode) return;

    if (index === 0) {
      setArea((prev) => ({ ...prev, start: coordinate }));
    } else {
      const newAreaPoints = [...area.points];
      newAreaPoints[index] = coordinate;
      updateAreaPoints(newAreaPoints);
    }
  }, [drawingMode, area.points, updateAreaPoints]);

  const handleMapPress = useCallback(({ nativeEvent: { coordinate } }: any) => {
    if (!drawingMode) return;

    setArea((prev) => ({
      ...prev,
      start: prev.start || coordinate,
      points: [...prev.points, coordinate],
    }));
  }, [drawingMode]);

  const handleClearArea = useCallback(() => {
    setArea({ start: null, points: [], name: '', color: COLORS[0] });
  }, []);

  const handleSaveArea = useCallback(() => {
    const isValidArea = area.points.length >= 3 && area.name;
    if (isValidArea) {
      const newArea: Area = { name: area.name, points: area.points, color: area.color };
      setAreas((prev) => [...prev, newArea]);
      handleClearArea();
      setDrawingMode(false);
    } else {
      alert("Por favor, forneça uma área válida com pelo menos 3 pontos e um nome.");
    }
  }, [area, handleClearArea]);

  const handleEditArea = useCallback((index: number) => {
    const selectedArea = areas[index];

    if (selectedArea) {
      setArea({ start: null, points: selectedArea.points, name: selectedArea.name, color: selectedArea.color });
      setDrawingMode(true);
      setAreas((prev) => prev.filter((_, i) => i !== index));
    }
  }, [areas]);

  const handleTurnOnRobot = () => { /* Implementar lógica para ligar o robô */ };
  const handleTurnOffRobot = () => { /* Implementar lógica para desligar o robô */ };
  const handleToggleWaterPumps = () => { /* Implementar lógica para controlar as bombas d'água */ };
  const handleMoveRobot = (direction: string) => { /* Implementar lógica para mover o robô */ };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <TouchableOpacity onPress={handleDrawArea} style={styles.button}>
          <Text style={styles.buttonText}>{drawingMode ? 'Concluir Área' : 'Desenhar Área'}</Text>
        </TouchableOpacity>
        {drawingMode && (
          <>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleClearArea}>
              <Text style={styles.buttonText}>Limpar Área</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Nome da Área:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome da área"
              value={area.name}
              onChangeText={(text) => setArea((prev) => ({ ...prev, name: text }))}
            />
            <Text style={styles.label}>Cor da Área:</Text>
            <View style={styles.colorPalette}>
              {COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                  onPress={() => setArea((prev) => ({ ...prev, color }))}
                />
              ))}
            </View>
          </>
        )}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2ecc71' }]} onPress={handleSaveArea}>
          <Text style={styles.buttonText}>Salvar Área</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Áreas Salvas:</Text>
        <FlatList
          data={areas}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.areaItem, { backgroundColor: item.color }]}
              onPress={() => handleEditArea(index)}
            >
              <Text style={styles.areaItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        {!manualMode ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#f1c40f' }]}
            onPress={() => setManualMode(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Controlar Manualmente</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.joystickContainer}>
            <View style={styles.joystick}>
              <TouchableOpacity
                style={[styles.joystickButton, styles.joystickButtonUp]}
                onPress={() => handleMoveRobot('forward')}
                activeOpacity={0.7}
              >
                <Text style={styles.joystickButtonText}>↑</Text>
              </TouchableOpacity>
              <View style={styles.joystickAxis}>
                <TouchableOpacity
                  style={[styles.joystickButton, styles.joystickButtonLeft]}
                  onPress={() => handleMoveRobot('left')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.joystickButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.joystickCenter}>
                  <TouchableOpacity
                    style={[styles.joystickButton, styles.joystickButtonCenter]}
                    onPress={() => handleMoveRobot('stop')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.joystickButtonText}>⏹️</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.joystickButton, styles.joystickButtonRight]}
                  onPress={() => handleMoveRobot('right')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.joystickButtonText}>→</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.joystickButton, styles.joystickButtonDown]}
                onPress={() => handleMoveRobot('backward')}
                activeOpacity={0.7}
              >
                <Text style={styles.joystickButtonText}>↓</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e74c3c' }]}
              onPress={() => setManualMode(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#27ae60' }]} onPress={handleTurnOnRobot}>
          <Text style={styles.buttonText}>Ligar Robô</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleTurnOffRobot}>
          <Text style={styles.buttonText}>Desligar Robô</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#3498db' }]} onPress={handleToggleWaterPumps}>
          <Text style={styles.buttonText}>Ligar/Desligar Bombas d'Água</Text>
        </TouchableOpacity>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {areas.map((area, index) => (
          <Polygon
            key={index}
            coordinates={area.points}
            strokeColor={area.color}
            fillColor={`${area.color}33`} // Cor de preenchimento com transparência
            strokeWidth={2}
          />
        ))}
        {drawingMode && area.start && (
          <Marker
            coordinate={area.start}
            draggable
            onDragEnd={(e) => handleMarkerDrag(e.nativeEvent.coordinate, 0)}
            onPress={() => handleMarkerPress(0)}
          />
        )}
        {area.points.map((point, index) => (
          <Marker
            key={index + 1}
            coordinate={point}
            draggable
            onDragEnd={(e) => handleMarkerDrag(e.nativeEvent.coordinate, index + 1)}
            onPress={() => handleMarkerPress(index + 1)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    padding: 16,
    backgroundColor: '#34495e',
    justifyContent: 'space-between',
  },
  map: {
    flex: 1,
  },
  button: {
    backgroundColor: '#2980b9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    color: '#ffffff',
  },
  label: {
    color: '#ffffff',
    marginVertical: 4,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  areaItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  areaItemText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  joystickContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystick: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystickAxis: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
  },
  joystickButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2980b9',
    marginHorizontal: 4,
  },
  joystickButtonText: {
    color: '#ffffff',
    fontSize: 24,
  },
  joystickButtonUp: {
    backgroundColor: '#27ae60',
  },
  joystickButtonDown: {
    backgroundColor: '#e67e22',
  },
  joystickButtonLeft: {
    backgroundColor: '#9b59b6',
  },
  joystickButtonRight: {
    backgroundColor: '#3498db',
  },
  joystickButtonCenter: {
    backgroundColor: '#e74c3c',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  joystickCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
