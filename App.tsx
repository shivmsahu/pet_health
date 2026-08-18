import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'Home' | 'Schedule' | 'Journal' | 'Awards';
type Activity = { id: number; icon: keyof typeof Ionicons.glyphMap; title: string; time: string; tint: string; done: boolean };

const pets = [
  { id: 1, name: 'Mochi', kind: 'Shiba · 3 yrs', emoji: '🐕', color: '#F5A66D' },
  { id: 2, name: 'Bean', kind: 'Tabby · 1 yr', emoji: '🐈', color: '#91B89B' },
];

const initialActivities: Activity[] = [
  { id: 1, icon: 'restaurant-outline', title: 'Breakfast', time: '8:00 AM', tint: '#F7B879', done: true },
  { id: 2, icon: 'medical-outline', title: 'Daily vitamin', time: '9:30 AM', tint: '#92C4A0', done: false },
  { id: 3, icon: 'paw-outline', title: 'Park walk', time: '5:30 PM · 30 min', tint: '#8CB7D8', done: false },
  { id: 4, icon: 'tennisball-outline', title: 'Play time', time: '7:00 PM · 15 min', tint: '#D7A6C5', done: false },
];

const memories = [
  { id: 1, title: 'Best beach day!', date: 'AUG 12', emoji: '🌊', color: '#A7D7E5', note: 'Mochi finally chased the waves.' },
  { id: 2, title: 'Sunday snooze', date: 'AUG 08', emoji: '💤', color: '#E8C3A6', note: 'Found the sunniest spot in the house.' },
  { id: 3, title: 'New favorite toy', date: 'JUL 29', emoji: '🎾', color: '#BFD5A4', note: 'The squeaky avocado is a winner!' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('Home');
  const [selectedPet, setSelectedPet] = useState(0);
  const [activities, setActivities] = useState(initialActivities);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [pickedPhoto, setPickedPhoto] = useState<string | null>(null);

  const progress = useMemo(() => activities.filter(a => a.done).length, [activities]);
  const pet = pets[selectedPet];

  const toggleActivity = (id: number) => setActivities(list => list.map(a => a.id === id ? { ...a, done: !a.done } : a));

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setPickedPhoto(result.assets[0].uri);
  };

  const addMoment = () => {
    if (!newTitle.trim()) return;
    setShowAdd(false); setNewTitle(''); setPickedPhoto(null);
    Alert.alert('Memory saved', 'A sweet new moment was added to the scrapbook.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header pet={pet} onPressPet={() => setSelectedPet(i => (i + 1) % pets.length)} />
          {tab === 'Home' && <Home activities={activities} progress={progress} pet={pet} onToggle={toggleActivity} onSeeSchedule={() => setTab('Schedule')} />}
          {tab === 'Schedule' && <Schedule activities={activities} onToggle={toggleActivity} />}
          {tab === 'Journal' && <Journal onAdd={() => setShowAdd(true)} />}
          {tab === 'Awards' && <Awards progress={progress} />}
        </ScrollView>
        <TabBar selected={tab} onSelect={setTab} />
      </View>
      <AddMomentModal visible={showAdd} title={newTitle} photo={pickedPhoto} onTitle={setNewTitle} onPhoto={pickPhoto} onClose={() => setShowAdd(false)} onSave={addMoment} />
    </SafeAreaView>
  );
}

function Header({ pet, onPressPet }: { pet: typeof pets[0]; onPressPet: () => void }) {
  return <View style={styles.header}>
    <View><Text style={styles.eyebrow}>TUESDAY, AUGUST 18</Text><Text style={styles.greeting}>Good morning! <Text>☀️</Text></Text></View>
    <Pressable style={styles.avatar} onPress={onPressPet}><Text style={styles.avatarEmoji}>{pet.emoji}</Text><View style={styles.onlineDot} /></Pressable>
  </View>;
}

function PetCard({ pet }: { pet: typeof pets[0] }) {
  return <View style={styles.petCard}>
    <View style={styles.petArt}><View style={styles.sun} /><Text style={styles.petEmoji}>{pet.emoji}</Text><Text style={styles.sparkle}>✦</Text></View>
    <View style={styles.petInfo}><Text style={styles.petName}>{pet.name}</Text><Text style={styles.petMeta}>{pet.kind}</Text><View style={styles.moodPill}><Text style={styles.moodText}>●  Feeling pawsome</Text></View></View>
    <Pressable style={styles.more}><Ionicons name="ellipsis-horizontal" size={20} color="#6E716B" /></Pressable>
  </View>;
}

function Home({ activities, progress, pet, onToggle, onSeeSchedule }: { activities: Activity[]; progress: number; pet: typeof pets[0]; onToggle: (id:number)=>void; onSeeSchedule:()=>void }) {
  return <>
    <PetCard pet={pet} />
    <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>Today's care</Text><Text style={styles.sectionSub}>{progress} of {activities.length} completed</Text></View><Pressable onPress={onSeeSchedule}><Text style={styles.link}>See schedule</Text></Pressable></View>
    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(progress / activities.length) * 100}%` }]} /></View>
    <View style={styles.activityList}>{activities.map(a => <ActivityRow key={a.id} activity={a} onToggle={onToggle} />)}</View>
    <View style={styles.streakCard}><View style={styles.streakIcon}><Text style={{fontSize: 25}}>🔥</Text></View><View style={{flex:1}}><Text style={styles.streakTitle}>7 day care streak!</Text><Text style={styles.streakText}>Keep showing up for your best friend.</Text></View><Text style={styles.streakCount}>7</Text></View>
    <View style={styles.tip}><Text style={styles.tipIcon}>💡</Text><View style={{flex:1}}><Text style={styles.tipLabel}>DAILY TAIL-WAG</Text><Text style={styles.tipText}>A sniffy walk is enriching, too. Let {pet.name} choose the route today!</Text></View></View>
  </>;
}

function ActivityRow({ activity: a, onToggle }: { activity: Activity; onToggle:(id:number)=>void }) {
  return <Pressable style={styles.activity} onPress={() => onToggle(a.id)}>
    <View style={[styles.activityIcon, { backgroundColor: a.tint + '35' }]}><Ionicons name={a.icon} size={22} color={a.tint} /></View>
    <View style={{flex:1}}><Text style={[styles.activityTitle, a.done && styles.doneText]}>{a.title}</Text><Text style={styles.activityTime}>{a.time}</Text></View>
    <View style={[styles.check, a.done && styles.checked]}>{a.done && <Ionicons name="checkmark" size={17} color="white" />}</View>
  </Pressable>;
}

function Schedule({ activities, onToggle }: { activities: Activity[]; onToggle:(id:number)=>void }) {
  return <><Text style={styles.pageTitle}>Care schedule</Text><Text style={styles.pageIntro}>A calm rhythm for happy, healthy pets.</Text><View style={styles.dateStrip}>{['M\n17','T\n18','W\n19','T\n20','F\n21'].map((d,i)=><View key={i} style={[styles.dateCell,i===1&&styles.dateActive]}><Text style={[styles.dateText,i===1&&{color:'white'}]}>{d}</Text></View>)}</View><Text style={styles.timelineLabel}>TODAY · 4 TASKS</Text><View style={styles.activityList}>{activities.map(a=><ActivityRow key={a.id} activity={a} onToggle={onToggle}/>)}</View><Pressable style={styles.primaryButton}><Ionicons name="add" size={20} color="white"/><Text style={styles.primaryText}>Add care reminder</Text></Pressable></>;
}

function Journal({ onAdd }: { onAdd:()=>void }) {
  return <><View style={styles.pageTitleRow}><View><Text style={styles.pageTitle}>Little moments</Text><Text style={styles.pageIntro}>Your scrapbook of happy days.</Text></View><Pressable style={styles.addRound} onPress={onAdd}><Ionicons name="add" size={25} color="white" /></Pressable></View><View style={styles.memoryGrid}>{memories.map((m,i)=><View key={m.id} style={[styles.memoryCard, i===0&&styles.memoryWide, {transform:[{rotate: i%2 ? '1.5deg':'-1deg'}]}]}><View style={[styles.photoPlaceholder,{backgroundColor:m.color}]}><Text style={styles.memoryEmoji}>{m.emoji}</Text><View style={styles.tape}/></View><Text style={styles.memoryDate}>{m.date}</Text><Text style={styles.memoryTitle}>{m.title}</Text><Text style={styles.memoryNote}>{m.note}</Text></View>)}</View><Pressable style={styles.dashedAdd} onPress={onAdd}><Ionicons name="camera-outline" size={25} color="#B36D54"/><Text style={styles.dashedText}>Add a little moment</Text></Pressable></>;
}

function Awards({ progress }: { progress:number }) {
  const awards = [{icon:'🌱',name:'Fresh start',desc:'Complete your first care task',unlocked:true},{icon:'🔥',name:'On a roll',desc:'Keep a 7-day care streak',unlocked:true},{icon:'🗺️',name:'Trail buddy',desc:'Log 10 walks together',unlocked:false},{icon:'📸',name:'Memory maker',desc:'Save 12 scrapbook moments',unlocked:false}];
  return <><Text style={styles.pageTitle}>Paw-some progress</Text><Text style={styles.pageIntro}>Tiny wins make a beautiful life together.</Text><View style={styles.levelCard}><Text style={styles.levelEmoji}>🏵️</Text><View style={{flex:1}}><Text style={styles.levelLabel}>LEVEL 4</Text><Text style={styles.levelTitle}>Thoughtful Human</Text><View style={styles.xpTrack}><View style={[styles.xpFill,{width:`${55+progress*5}%`}]} /></View><Text style={styles.xpText}>340 / 500 kindness points</Text></View></View><Text style={styles.timelineLabel}>BADGES · 2 OF 4</Text><View style={styles.badgeGrid}>{awards.map(a=><View key={a.name} style={[styles.badge,a.unlocked?null:styles.locked]}><Text style={styles.badgeEmoji}>{a.icon}</Text><Text style={styles.badgeName}>{a.name}</Text><Text style={styles.badgeDesc}>{a.desc}</Text>{!a.unlocked&&<Ionicons style={styles.lock} name="lock-closed" size={13} color="#969990"/>}</View>)}</View></>;
}

function TabBar({ selected, onSelect }: { selected:Tab; onSelect:(t:Tab)=>void }) {
  const tabs: {name:Tab; icon:keyof typeof Ionicons.glyphMap}[] = [{name:'Home',icon:'home-outline'},{name:'Schedule',icon:'calendar-outline'},{name:'Journal',icon:'images-outline'},{name:'Awards',icon:'ribbon-outline'}];
  return <View style={styles.tabBar}>{tabs.map(t=><Pressable key={t.name} style={styles.tab} onPress={()=>onSelect(t.name)}><Ionicons name={selected===t.name?t.icon.replace('-outline','') as any:t.icon} size={22} color={selected===t.name?'#B6634B':'#999B95'}/><Text style={[styles.tabText,selected===t.name&&styles.tabSelected]}>{t.name}</Text></Pressable>)}</View>;
}

function AddMomentModal({visible,title,photo,onTitle,onPhoto,onClose,onSave}:{visible:boolean;title:string;photo:string|null;onTitle:(s:string)=>void;onPhoto:()=>void;onClose:()=>void;onSave:()=>void}) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalShade}><View style={styles.modal}><View style={styles.modalHandle}/><Text style={styles.modalTitle}>Save a little moment</Text><Pressable style={styles.photoPicker} onPress={onPhoto}>{photo?<Image source={{uri:photo}} style={styles.pickedImage}/>:<><Ionicons name="camera" size={31} color="#B6634B"/><Text style={styles.photoPickerText}>Choose a photo</Text></>}</Pressable><Text style={styles.inputLabel}>WHAT HAPPENED?</Text><TextInput value={title} onChangeText={onTitle} placeholder="The sweetest afternoon..." placeholderTextColor="#AAA9A2" style={styles.input}/><Pressable style={[styles.primaryButton,!title.trim()&&{opacity:.45}]} onPress={onSave} disabled={!title.trim()}><Text style={styles.primaryText}>Add to scrapbook</Text></Pressable><Pressable onPress={onClose}><Text style={styles.cancel}>Maybe later</Text></Pressable></View></View></Modal>;
}

const ink = '#30342F';
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#FFF9F1',paddingTop:Platform.OS==='android'?RNStatusBar.currentHeight:0},appShell:{flex:1,width:'100%',maxWidth:520,alignSelf:'center',backgroundColor:'#FFF9F1'},content:{paddingHorizontal:22,paddingTop:16,paddingBottom:120},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:22},eyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.6,color:'#99978F',marginBottom:6},greeting:{fontSize:24,fontWeight:'800',color:ink,letterSpacing:-.6},avatar:{width:49,height:49,borderRadius:18,backgroundColor:'#F5DDC5',alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'white'},avatarEmoji:{fontSize:27},onlineDot:{position:'absolute',right:-1,bottom:1,width:12,height:12,borderRadius:6,backgroundColor:'#75A77E',borderWidth:2,borderColor:'#FFF9F1'},
  petCard:{height:160,borderRadius:28,backgroundColor:'#F9D8C3',overflow:'hidden',flexDirection:'row',alignItems:'center',padding:20,marginBottom:27},petArt:{width:116,height:116,borderRadius:58,backgroundColor:'#F6C6A8',alignItems:'center',justifyContent:'center',marginRight:15},sun:{position:'absolute',width:72,height:72,borderRadius:36,backgroundColor:'#FFE8B6'},petEmoji:{fontSize:65,zIndex:2},sparkle:{position:'absolute',right:3,top:12,fontSize:20,color:'#FFF'},petInfo:{flex:1},petName:{fontSize:28,fontWeight:'900',color:ink},petMeta:{fontSize:13,color:'#75746D',marginTop:2},moodPill:{marginTop:14,backgroundColor:'#FFF8EDAA',borderRadius:12,paddingVertical:6,paddingHorizontal:9,alignSelf:'flex-start'},moodText:{fontSize:10,fontWeight:'700',color:'#6F856C'},more:{position:'absolute',right:15,top:15,padding:5},
  sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'},sectionTitle:{fontSize:20,fontWeight:'900',color:ink},sectionSub:{fontSize:12,color:'#95958E',marginTop:4},link:{fontSize:12,fontWeight:'800',color:'#B6634B'},progressTrack:{height:5,borderRadius:5,backgroundColor:'#EDE8E0',marginVertical:14},progressFill:{height:5,borderRadius:5,backgroundColor:'#76A982'},activityList:{backgroundColor:'#FFFEFA',borderRadius:22,paddingHorizontal:15,shadowColor:'#8C7660',shadowOpacity:.07,shadowRadius:18,shadowOffset:{width:0,height:5},elevation:2},activity:{flexDirection:'row',alignItems:'center',gap:13,paddingVertical:14,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#EEEAE3'},activityIcon:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center'},activityTitle:{fontWeight:'800',fontSize:14,color:ink},activityTime:{fontSize:11,color:'#999991',marginTop:3},doneText:{textDecorationLine:'line-through',color:'#93958F'},check:{width:25,height:25,borderRadius:9,borderWidth:1.5,borderColor:'#D6D5CE',alignItems:'center',justifyContent:'center'},checked:{backgroundColor:'#78A981',borderColor:'#78A981'},
  streakCard:{marginTop:18,backgroundColor:'#FFF0C8',borderRadius:20,padding:15,flexDirection:'row',alignItems:'center',gap:12},streakIcon:{width:46,height:46,borderRadius:15,backgroundColor:'#FFE29B',alignItems:'center',justifyContent:'center'},streakTitle:{fontSize:14,fontWeight:'900',color:ink},streakText:{fontSize:11,color:'#79766D',marginTop:3},streakCount:{fontSize:35,fontWeight:'900',color:'#D68A43',marginRight:4},tip:{flexDirection:'row',gap:12,marginTop:18,padding:17,borderRadius:20,backgroundColor:'#E7F0E5'},tipIcon:{fontSize:24},tipLabel:{fontSize:10,fontWeight:'900',letterSpacing:1.2,color:'#699073'},tipText:{fontSize:12,lineHeight:18,color:'#596459',marginTop:4},
  pageTitle:{fontSize:29,fontWeight:'900',color:ink,letterSpacing:-.8},pageIntro:{fontSize:13,color:'#8D8D85',marginTop:5,marginBottom:22},pageTitleRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},addRound:{width:44,height:44,borderRadius:15,backgroundColor:'#B6634B',alignItems:'center',justifyContent:'center'},dateStrip:{flexDirection:'row',justifyContent:'space-between',marginBottom:26},dateCell:{width:53,height:65,borderRadius:18,backgroundColor:'#F0ECE5',alignItems:'center',justifyContent:'center'},dateActive:{backgroundColor:'#B6634B'},dateText:{textAlign:'center',lineHeight:22,fontWeight:'800',fontSize:13,color:'#777971'},timelineLabel:{fontSize:10,fontWeight:'900',letterSpacing:1.5,color:'#92928A',marginBottom:11},primaryButton:{height:52,borderRadius:17,marginTop:20,backgroundColor:'#B6634B',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},primaryText:{color:'white',fontSize:14,fontWeight:'900'},
  memoryGrid:{flexDirection:'row',flexWrap:'wrap',gap:13},memoryCard:{width:'48%',backgroundColor:'#FFF',padding:9,paddingBottom:15,shadowColor:'#5D5145',shadowOpacity:.11,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:2},photoPlaceholder:{height:132,alignItems:'center',justifyContent:'center',overflow:'visible'},memoryWide:{width:'100%'},memoryEmoji:{fontSize:53},tape:{position:'absolute',top:-13,width:55,height:22,backgroundColor:'#F5E5C5CC',transform:[{rotate:'-4deg'}]},memoryDate:{fontSize:9,fontWeight:'900',letterSpacing:1.1,color:'#A09D94',marginTop:11},memoryTitle:{fontSize:15,fontWeight:'900',color:ink,marginTop:4},memoryNote:{fontSize:10,lineHeight:15,color:'#85857D',marginTop:4},dashedAdd:{marginTop:25,borderWidth:1.5,borderStyle:'dashed',borderColor:'#D8B9A8',height:80,borderRadius:20,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:10},dashedText:{fontWeight:'800',color:'#B36D54'},
  levelCard:{backgroundColor:'#EAD8B9',borderRadius:25,padding:20,flexDirection:'row',alignItems:'center',gap:17,marginBottom:28},levelEmoji:{fontSize:50},levelLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.4,color:'#9A704F'},levelTitle:{fontSize:18,fontWeight:'900',color:ink,marginTop:3},xpTrack:{height:6,backgroundColor:'#D8C29D',borderRadius:5,marginTop:12},xpFill:{height:6,backgroundColor:'#B36D54',borderRadius:5},xpText:{fontSize:9,color:'#817461',marginTop:5},badgeGrid:{flexDirection:'row',flexWrap:'wrap',gap:12},badge:{width:'48%',minHeight:170,borderRadius:22,backgroundColor:'#FFFEFA',padding:18,alignItems:'center',justifyContent:'center',position:'relative'},locked:{opacity:.5},badgeEmoji:{fontSize:43},badgeName:{fontSize:14,fontWeight:'900',color:ink,marginTop:10},badgeDesc:{fontSize:10,textAlign:'center',lineHeight:15,color:'#85877F',marginTop:5},lock:{position:'absolute',right:12,top:12},
  tabBar:{position:'absolute',bottom:0,left:0,right:0,height:84,paddingBottom:Platform.OS==='ios'?18:6,backgroundColor:'#FFFEFBF5',borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#E8E1D8',flexDirection:'row',alignItems:'center',justifyContent:'space-around'},tab:{alignItems:'center',justifyContent:'center',gap:4,minWidth:65},tabText:{fontSize:9,fontWeight:'700',color:'#999B95'},tabSelected:{color:'#B6634B'},
  modalShade:{flex:1,backgroundColor:'#332E2855',justifyContent:'flex-end'},modal:{backgroundColor:'#FFF9F1',borderTopLeftRadius:30,borderTopRightRadius:30,padding:24,paddingBottom:35},modalHandle:{width:42,height:5,borderRadius:5,backgroundColor:'#D8D2CA',alignSelf:'center',marginBottom:18},modalTitle:{fontSize:23,fontWeight:'900',color:ink,marginBottom:18},photoPicker:{height:150,borderRadius:20,backgroundColor:'#F3E8DC',alignItems:'center',justifyContent:'center',overflow:'hidden'},photoPickerText:{fontSize:12,fontWeight:'800',color:'#B6634B',marginTop:8},pickedImage:{width:'100%',height:'100%'},inputLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.4,color:'#8F8E87',marginTop:19,marginBottom:7},input:{height:52,borderWidth:1,borderColor:'#DED8CF',backgroundColor:'#FFF',borderRadius:15,paddingHorizontal:15,fontSize:14,color:ink},cancel:{textAlign:'center',fontSize:12,fontWeight:'800',color:'#8E8C85',marginTop:17}
});
