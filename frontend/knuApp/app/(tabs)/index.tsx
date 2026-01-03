import React, { useEffect, useState, useMemo } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  Linking, RefreshControl, StatusBar, TextInput, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. 백엔드 데이터 구조에 맞춘 인터페이스 정의 [cite: 204]
interface Notice {
  id: number;
  title: string;
  link: string;
  created_at: string;
}

export default function HomeScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // 2. 제공해주신 새 서버 IP 설정
  const SERVER_URL = "http://192.168.45.116:8000/api/notices";

  // 데이터 가져오기 함수
  const fetchNotices = async () => {
    try {
      const response = await fetch(SERVER_URL);
      if (!response.ok) throw new Error("서버 응답 없음");
      const data = await response.json();
      setNotices(data);
    } catch (e) {
      console.error("데이터 로드 실패:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 3. 실시간 검색 필터링 로직 (성능 최적화) [cite: 191]
  const filteredData = useMemo(() => {
    return notices.filter(n => 
      n.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, notices]);

  // 공지사항 카드 렌더링
  const renderItem = ({ item }: { item: Notice }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => Linking.openURL(item.link)} // 원문 링크 연결 [cite: 191]
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>전체공지</Text>
        </View>
        <Text style={styles.dateText}>
          {item.created_at ? item.created_at.split('T')[0] : '날짜 없음'}
        </Text>
      </View>
      <Text style={styles.titleText} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.footerText}>강남대학교 공지사항 바로가기</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#003594" />
      
      {/* 고정 헤더 영역 [cite: 105] */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KANGNAM UNIV. NOTICES</Text>
        <TextInput 
          style={styles.searchBar}
          placeholder="제목으로 공지사항 검색..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#003594" />
          <Text style={{marginTop: 10, color: '#666'}}>공지를 가져오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchNotices(); }} 
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  header: { 
    backgroundColor: '#003594', // 강남대 메인 컬러 느낌
    padding: 20, 
    borderBottomLeftRadius: 15, 
    borderBottomRightRadius: 15,
    elevation: 5,
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15,
    textAlign: 'center'
  },
  searchBar: { 
    backgroundColor: 'white', 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    height: 45,
    fontSize: 15,
  },
  listContent: { paddingBottom: 20 },
  card: { 
    backgroundColor: 'white', 
    marginHorizontal: 16, 
    marginTop: 12, 
    padding: 16, 
    borderRadius: 12,
    // 그림자 설정
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  badge: { 
    backgroundColor: '#E8F0FE', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 5 
  },
  badgeText: { color: '#003594', fontSize: 11, fontWeight: 'bold' },
  dateText: { color: '#999', fontSize: 12 },
  titleText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    lineHeight: 22,
    marginBottom: 10
  },
  footerText: { fontSize: 12, color: '#004EA2', textAlign: 'right' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 15, color: '#888' }
});