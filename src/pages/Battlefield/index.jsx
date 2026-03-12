import { useEffect, useState, useMemo, useCallback, lazy, Suspense, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useLocation } from 'wouter'
/*const BattleWindow = lazy(()=> import('../../components/battleWindow/battleWindow.jsx'))*/import BattleWindow from '../../components/battleWindow/battleWindow.jsx'
import {io} from 'https://cdn.socket.io/4.8.0/socket.io.esm.min.js'


export default memo(function Battlefield({socket, roomId, paramId, P1, P2, TYPES, PLAYER}){
	const {VITE_API_URL : API_URL} = import.meta.env;
  // const socket = params.socket //io(`${API_URL}`)
  const [path, setLocation] = useLocation();
  const [pokemonTwo, setPokemonTwo] = useState(P2[0])
  const [pokemonOne, setPokemonOne] = useState(P1[0])
  const [moveRunning, setMoveRunning] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [effectEntrie, setEffectEntrie] = useState()
  const [renderImageOne, setRenderImageOne] = useState(P1)
  const [renderImageTwo, setRenderImageTwo] = useState(P2)
  const [types, setTypes] = useState(TYPES)
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER)
  const [animationTwo, setAnimationTwo] = useState(false)
  const [animationOne, setAnimationOne] = useState(false)
  const token = localStorage.getItem('token')
  const [playerOneMove, setPlayerOneMove] = useState(null)
  const [playerTwoMove, setPlayerTwoMove] = useState(null) 
  const [turn, setTurn] = useState(1)
  const [gameState, setGameState] = useState("Active")
  const [battleMusic, setBattleMusic] = useState(()=>{ const song = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/wild_4.ogg'); song.volume = 0.4; return song; })
  const [damageDoneOne, setDamageDoneOne] = useState()

  useEffect(()=>{
    if(battleMusic){
    /*const song = new Audio('http://localhost:5173/src/pages/Iamatch/wild.ogg')
    song.volume = 0.1;
    setBattleMusic(song)*/
    battleMusic.play();
    battleMusic.addEventListener('ended', () => {
    battleMusic.play(); // Reproduce el audio nuevamente al finalizar
    }); 
  }
  },[])




  const turnSystem = async ()=>{
   if(playerOneMove != null && playerTwoMove != null){
    // const {velocidadUno, velocidadDos} = [pokemonOne.stats[4].actual_stat, pokemonTwo.stats[4].actual_stat]

    const velocidadUno = pokemonOne.stats[5].actual_stat
    const velocidadDos = pokemonTwo.stats[5].actual_stat
    const PrimerMovimiento = playerOneMove.type == "PokemonChange" ? playerOneMove : playerTwoMove.type == "PokemonChange" ? playerTwoMove : velocidadUno > velocidadDos ? playerOneMove : playerTwoMove
    const SegundoMovimiento = PrimerMovimiento.player == "One" ? playerTwoMove : playerOneMove


    const resolution = await handleAttack(PrimerMovimiento).then(async resolution => {return resolution} /*== "Enemigo vivo" ? await handleAttack(SegundoMovimiento) : console.log(resolution)*/)
    /*const updatedIndex = {
      resolution
    }*/
    resolution.name == "Enemigo vivo" && await handleAttack(SegundoMovimiento)
    resolution.name == "Pokemon changed" && await handleAttack({...SegundoMovimiento, updatedIndex: resolution })

    //await handleAttack(PrimerAtaque).then(resolution => resolution == "Enemigos abatidos" ? setGameState(`${PrimerAtaque.player} gana`) : handleAttack(SegundoAtaque).then(resolution => resolution == "Enemigos abatidos" ? setGameState(`${SegundoAtaque.player} gana`) : null))
    /*velocidadUno > velocidadDos ? await handleAttack(playerOneMove).then(resolution => resolution == "Enemigos abatidos" ? setGameState("Winner") : handleAttack(playerTwoMove))
                                : await handleAttack(playerTwoMove).then(resolution => resolution == "Enemigo vivo" && handleAttack(playerOneMove))*/   
    setPlayerOneMove(null)
    setPlayerTwoMove(null)
   } 
  }
// HAY QUE PONER LA CONDICIONAL DE DOS ATAQUES SETEADOS ACA, EN VEZ DE ARRIBA!!
useEffect(() => {
  const handleTurn = async () => {
    await turnSystem();
  };
  if(playerOneMove != null && playerTwoMove != null){  handleTurn(); }
}, [playerOneMove, playerTwoMove]);

  const getEffectiveness = (movetype, enemytypes)=>{
  const mtype = types.find(type => type.name == movetype.name).damage_relations
  let isDouble = mtype.double_damage_to.some(type => enemytypes.some(t => t.type.name == type.name))
  let isHalf = mtype.half_damage_to.some(type => enemytypes.some(t => t.type.name == type.name))
  let isNo = mtype.no_damage_to.some(type => enemytypes.some(t => t.type.name == type.name))
  
  const effectiveness = isDouble ? 2 : isHalf ? 0.5 : isNo ? 0 : 1
  return(effectiveness)  
  }

  const getBonus = (movetype, owntypes) =>{
  let Is50Percent = owntypes.some(owntype => owntype.type.name == movetype.name)
  const bonus = Is50Percent ? 1.5 : 1
  return bonus
  }


	/*useEffect(() => {
 // dispatch(getPokemon(''))
  Promise.all([
    fetch(`${API_URL}pokemons/users/pokemon`),
    fetch(`${API_URL}pokemons/data/types`),
  ])
  .then(([response1, response2, response3]) => {
    Promise.all([response1.json(), response2.json()])
    .then(([data1, data2]) => {
      
      setRenderData(data1);
      setTypes(data2);
    });
  });
}, []);*/

  const count1 = useMotionValue(0)
  const rounded1 = useTransform(count1, latest => Math.round(latest))  

  const count2 = useMotionValue(0)
  const rounded2 = useTransform(count2, latest => Math.round(latest)) 
 

  useEffect(() => {
  const controls = animate(count1, pokemonOne?.hp_state ?? 0, {velocity:2, duration:2})
  return () => controls.stop()
}, [pokemonOne])

  useEffect(() => {
  const controls = animate(count2, pokemonTwo?.hp_state ?? 0, {velocity:2, duration:2})
  return () => controls.stop()
}, [pokemonTwo])


/*const handlePlaySound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.2;
    audio.play();
}*/

const pokemonDefeated = (winner, defeated) => {
  return new Promise(async(resolver)=>{
 
  const enemy = winner == "One" ? pokemonTwo : pokemonOne
  const attacker = winner == "One" ? pokemonOne : pokemonTwo
  const attackerPokeballs = winner == "One" ? renderImageOne : renderImageTwo 
  const enemyPokeballs = winner == "One" ? renderImageTwo : renderImageOne
  const setEnemyPokeballs = winner == "One" ? setRenderImageTwo : setRenderImageOne
  const setAttackerPokeballs = winner == "One" ? setRenderImageOne : setRenderImageTwo

    /*const effectEntriePromise  = new Promise((resolve, reject)=>{
        setTimeout(()=>{
          resolve(
            setEffectEntrie(attacker.name.toUpperCase() + " Ha subido de nivel!")
            )
        },2000)
      })
    const endMatchPromise  = new Promise((resolve, reject)=>{
        setTimeout(()=>{
          resolve(
            setIsReady(false)
            )
        },2000)
      })*/
  
  // const aviableEnemyPokeballs = enemyPokeballs.filter(pokeball => pokeball.hp_state > 0)

  const defeatedEnemyIndexInPokeballs = enemyPokeballs.findIndex(pokeball=> pokeball.index == defeated.index/*aviableEnemyPokeballs[0].index*/)
  //const aviableEnemyPokeballs = enemyPokeballs.findIndex(pokeball => pokeball.index != defeated.index) //
  const aviableEnemyPokeballs = enemyPokeballs.findIndex(pokeball => pokeball.hp_state != 0)

  if(aviableEnemyPokeballs != -1)  {
  setEffectEntrie(enemy.name.toUpperCase() + " Ha sido derrotado!")
  await new Promise(resolve => setTimeout(() => resolve(
        setMoveRunning(false),
        //emitSetPokemon(aviableEnemyPokeballs, winner == "One" ? "Two" : "One"),
        /*setEnemyPokeballs(prevEP=>{
          const newEnemyPokeballs = [...prevEP];
          newEnemyPokeballs[defeatedEnemyIndexInPokeballs].hp_state = 0
          return newEnemyPokeballs
          }),*/
          resolver("Pokemon derrotado"),
        ), 2000))  } else{
  const pokeballsState = await attackerPokeballs.map(pokeball=>{
    let state = {
      index : pokeball.index,
      hp : pokeball.hp_state
    }
    return state
  })
  const enemyBaseExperience = enemy.base_experience; // Valor base ajustable
  const enemyLevel = enemy.level
  const experienciaGanada = enemyBaseExperience * enemyLevel / 7; 
  const E = enemy.base_experience // Exp base del enemigo derrotado
  const Nv = enemy.level // Nivel del enemigo derrotado
  const NvU = attacker.level // Nivel del pokemon aliado
  const P = 1 // Participantes
  const Base = E * Nv / P / 5
  const Corrector_A = (2 * Nv + 10) ^ (5/2)
  const Corrector_B = (Nv + NvU + 10)  ^ (5/2)
  const Bonus = 1
  const Poder = 1
  const Exp = (Base * Corrector_A / Corrector_B +1) * Bonus * Poder
  /*const updatedPokemon = await fetch(`${API_URL}pokemons/users/updatelevel`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
          userId : token,
          pokeballsState,
          pokemonExp : Exp
        })
      }).then(response => response.json())
  setEffectEntrie(attacker.name.toUpperCase() + " Ha ganado " + Math.floor(Exp) + " EXP!")
  updatedPokemon.level != NvU && await new Promise(resolve => setTimeout(() => resolve(setEffectEntrie(attacker.name.toUpperCase() + " Ha subido de nivel!")), 2000))*/

  await new Promise(resolve => setTimeout(() => resolve(
    setEffectEntrie(attacker.name.toUpperCase() + " WINS"),
    setGameState(`${winner} wins`),
   // setAttackerPokeballs(ep=>[...ep.slice(0, target.index), updatedPokemon, ...ep.slice(target.index + 1)])
    ), 2000))
  }


})
}





  const handleAttack = async ({move, index, updatedIndex, hitsToGive, randomVs, player, type})=>{
    
    if (type == "Attack") {
      const audio = new Audio(`https://github.com/jonylazarte/resources/raw/refs/heads/main/${move.name}.mp3`);
    audio.volume = 0.5;
    var attackDuration = 1;
    function obtenerDuracionVideo(audio) {
    return new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
            audio.play()
        });
        audio.addEventListener('error', () => {
            reject(new Error('Error loading audio file'));
        });
    });
    }
        try {
          const duracion = await obtenerDuracionVideo(audio);
          attackDuration = duracion;
        } catch (error) {
          console.error('Error getting audio duration:', error);
          // Handle the error gracefully, e.g., set a default duration or display an error message
          const alternativeAudio = new Audio(`https://github.com/jonylazarte/resources/raw/refs/heads/main/${"hit-normal-damage"}.mp3`);
          const alternativeDuration = await obtenerDuracionVideo(alternativeAudio);
          console.log(alternativeDuration)
          attackDuration = alternativeDuration;
          alternativeAudio.play() // Assuming a default duration
        }
    }
    const handlePlaySound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    audio.play();
    }
  return new Promise((resolve)=>{

  const attackerHP = player == "One" ? pokemonOne.stats[0].actual_stat : pokemonTwo.stats[0].actual_stat
  const targetHP = player == "One" ? pokemonTwo.stats[0].actual_stat : pokemonOne.stats[0].actual_stat
  const setTargetPokemon = player == "One" ? setPokemonTwo : setPokemonOne
  const setAnimation = player == "One" ? setAnimationTwo : setAnimationOne
  const enemyPokeballs = player == "One" ? renderImageTwo : renderImageOne
  const attackerPokeballs = player == "One" ? renderImageOne : renderImageTwo
  const setEnemyPokeballs = player == "One" ? setRenderImageTwo : setRenderImageOne
  const setAttackerPokeballs = player == "One" ? setRenderImageOne : setRenderImageTwo
  const updatedEnemyIndexInPokeballs = updatedIndex ? /*enemyPokeballs.findIndex(pokeball=> pokeball.index == updatedIndex.changedPokemonTo)*/ updatedIndex.changedPokemonTo : undefined
  const updatedEnemy = updatedEnemyIndexInPokeballs ? enemyPokeballs[updatedEnemyIndexInPokeballs] : undefined
  const attacker = player == "One" ? pokemonOne : pokemonTwo
  const target = updatedEnemy ? updatedEnemy : player == "One" ? pokemonTwo : pokemonOne;
  const enemyIndexInPokeballs = updatedEnemyIndexInPokeballs || enemyPokeballs.findIndex(pokeball=> pokeball.index == target.index)
  const attackerIndexInPokeballs = attackerPokeballs.findIndex(pokeball=> pokeball.index == attacker.index)

  console.log(updatedEnemy)
  console.log(updatedEnemyIndexInPokeballs)

  if(type == "Attack"){
  setMoveRunning(true)
  setEffectEntrie(attacker.name.toUpperCase() + " usó " + move.name.toUpperCase() +"!")
  //audio.play()
  /*var constantePokemon = attacker
  constantePokemon.moves[index].pp_state -= 1;*/

  // Reservado para la maquina // const hitsToGive = move.meta.max_hits != null ? Math.floor(Math.random() * (move.meta.max_hits - move.meta.min_hits +1)) + move.meta.min_hits : 1
  var hitsGiven = 0
  var localTargetHP = target.hp_state //updatedEnemy?.hp_state || player == "One" ? pokemonTwo.hp_state : pokemonOne.hp_state
  const processAttack = ()=>{
  var isFailed = Math.floor(Math.random() * 100 + 1) >= move.accuracy && move.accuracy != null ? true :  false
  const V = randomVs[hitsGiven]//Math.floor(Math.random() * 16) + 85; //Varación. entre 85 y 100
  const N = attacker.level // Nivel del pokemón atacante
  const A = attacker.stats[1].actual_stat // Cantidad de ataque. fisico-especial
  const D = updatedEnemy?.stats[2].actual_stat || target.stats[2].actual_stat // Defensa del rival. fisica-especial
  const B = getBonus(move.type, attacker?.types) //Bonificacion. 1 - 1.5 - 2
  const E = getEffectiveness(move.type, updatedEnemy?.types || target?.types) // Efectividad. 0 - 0.25 - 0.5 - 1 - 2 - 4
  const P = move.power
  console.log("Bonus: " + B, "Efectividad: "+ E )
  var finalDamage = Math.floor(0.01 * B * E * V * ( (0.2 * N + 1) * A * P / (25 * D) + 2))
          setTimeout(()=>{
          !isFailed ? localTargetHP = Math.max(0, localTargetHP - finalDamage) :  finalDamage = 0;
          !isFailed ? setDamageDoneOne(finalDamage) : setDamageDoneOne("Miss!")
          isFailed && setEffectEntrie("Ha fallado!");
          /*setTargetPokemon(prevPokemon =>{
           var newTargetPokemon = {...prevPokemon}
           newTargetPokemon.hp_state -= finalDamage
            return newTargetPokemon
          })*/
          setTargetPokemon(prevPokemon => ({ ...prevPokemon, hp_state: localTargetHP })); // esto se ejecuta 2 veces por el seteo del estado de abajo, y unicamente luego de cambiar un pokemon o al iniciar la batalla. Hay que arreglarlo!!
          setEnemyPokeballs(prevEP=>{
          const newEnemyPokeballs = [...prevEP];
          newEnemyPokeballs[enemyIndexInPokeballs].hp_state = localTargetHP
          return newEnemyPokeballs
          })
          setAttackerPokeballs(prevAP=>{
          const newAttackerPokeballs = [...prevAP];
          newAttackerPokeballs[attackerIndexInPokeballs].moves[index].pp_state -= 1
          return newAttackerPokeballs
          })
          hitsGiven += 1
          setAnimation(true)
          if(hitsToGive == hitsGiven){
                setTimeout(()=>{
                setAnimation(false)
                const effectEntrie = E == 2 ? "El ataque fue super efectivo" : E == 0.5 ? "El ataque tuvo un efecto debil" : hitsToGive != 1 ? "Golpeó " + hitsToGive + " Veces!" : null
                setEffectEntrie(effectEntrie)
                            setTimeout(async ()=>{           
                            if(localTargetHP <= 0) {
                              await pokemonDefeated(player, target);
                              resolve({name: "Enemigo derrotado"})
                            } else { setMoveRunning(false); resolve({name: "Enemigo vivo"}) }
                            },500)
                },500)} else processAttack()
          }, attackDuration * 1000 / 2)
    }
    processAttack()} else if(type == "PokemonChange"){
        setEffectEntrie(attacker.name.toUpperCase() + " se retira del combate.")
        setMoveRunning(true)
        setTimeout(()=>{
            emitSetPokemon({index, player})
            handlePlaySound(attackerPokeballs[index].cries.latest)
            setTimeout(()=>{
                setEffectEntrie(attackerPokeballs[index].name.toUpperCase() + " se une a la batalla!")
                setTimeout(()=>{
                    resolve({name: "Pokemon changed", player, changedPokemonTo: index});
                    setMoveRunning(false)
                },1000)   
            },1000)   
        },1500)        
    } else if(type == "Item"){
          if(index == 23) {
              setEffectEntrie("El jugador ha usado una poción!")
              setMoveRunning(true)
              setTimeout(()=>{
                  setAttackerPokeballs(prevAP=>{
                  const newAttackerPokeballs = [...prevAP];
                  newAttackerPokeballs[attackerIndexInPokeballs].hp_state = prevAP[attackerIndexInPokeballs].stats[0].actual_stat
                  return newAttackerPokeballs
                  })
                  setAttackerPokemon(prevPokemon => ({ ...prevPokemon, hp_state: prevPokemon.stats[0].actual_stat }));
                  setTimeout(()=>{
                      resolve("Enemigo vivo")
                      setMoveRunning(false)
                  },1500) 
              },1500)
              
          }
          if(index == 12){
              setEffectEntrie("El jugado ha lanzado una pokeball!")
              setMoveRunning(true)
              setTimeout(()=>{
                  setEffectEntrie(pokemonTwo.name.toUpperCase() + " ha sido capturado!")
                  setTimeout(()=>{
                    fetch(`${API_URL}pokemons/users/addpokemon`,{
                    method:'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({
                    "userID" : token,
                    "pokemonID" : pokemonTwo.id,
                    "pokemonName" : window.prompt("Choose the name to your pokemon", pokemonTwo.name.toUpperCase()) || pokemonTwo.name
                    }),
                    })
                    setTimeout(()=>{
                        setEffectEntrie(attacker.name.toUpperCase() + " ha ganado!")
                        setGameState(`One wins`)
                    },2000)
                  },1500)
              },3000)
          }
    }
}) 
}


  useEffect(() => {
    // Remove any existing listeners before adding a new one
    socket?.current?.off('setpokemon');
    socket?.current?.on('setpokemon', (msg) => {
      msg.player == "One" ? setPokemonOne(renderImageOne[msg.index]) : setPokemonTwo(renderImageTwo[msg.index])
      // Perform actions based on the message content here (e.g., update UI)
    });
    // Cleanup function to remove the listener when the component unmounts
    return () => socket?.current?.off('setpokemon');
  }, [renderImageOne, renderImageTwo, currentPlayer]);

  const emitSetPokemon = ({index, player})=>{
    socket?.current?.emit('setpokemon', ({index, player, roomId})) 
  }




useEffect(()=>{
  socket?.current.off?.('attack');
  socket?.current.on?.('attack', (msg) =>{
    //handleAttack(msg.move, msg.index, msg.hitsToGive, msg.randomVs, msg.currentPlayer)
    msg.player == "One" ? setPlayerOneMove(msg) : setPlayerTwoMove(msg) 
  })
  return () => socket?.current?.off('attack');
},[pokemonOne, pokemonTwo])

const emitAttack = ({move, index, type, player})=>{
  const hitsToGive = move && move.meta.max_hits != null ? Math.floor(Math.random() * (move.meta.max_hits - move.meta.min_hits +1)) + move.meta.min_hits : 1;
  var randomVs = []
  for(let i=0; i < hitsToGive ; i++){
     const V = Math.floor(Math.random() * 16) + 85;
     randomVs.push(V)
  }

  socket?.current?.emit('attack', ({move, index, hitsToGive, randomVs, roomId, player : player || currentPlayer, type}))
  setMoveRunning(true)
  setEffectEntrie("Esperando al oponente...")
}


	return <>
	<section className="battlefield-section">
  {currentPlayer == "One" && <BattleWindow player={"One"} socket={socket} pokemonOne={pokemonOne} pokemonTwo={pokemonTwo} renderImage={renderImageOne} enemyPokeballs={renderImageTwo} setPokemon={emitSetPokemon} setPlayerMove={emitAttack} rounded1={rounded1} rounded2={rounded2} effectEntrie={effectEntrie} moveRunning={moveRunning} gameState={gameState} animationOne={animationOne} animationTwo={animationTwo} damageDoneOne={damageDoneOne} battleMusic={battleMusic} ></BattleWindow>}

    
  {currentPlayer == "Two" && <BattleWindow player={"Two"} socket={socket} pokemonOne={pokemonTwo} pokemonTwo={pokemonOne} renderImage={renderImageTwo} enemyPokeballs={renderImageOne} setPokemon={emitSetPokemon} setPlayerMove={emitAttack} rounded1={rounded2} rounded2={rounded1} effectEntrie={effectEntrie} moveRunning={moveRunning} gameState={gameState} animationOne={animationTwo} animationTwo={animationOne} damageDoneOne={damageDoneOne} battleMusic={battleMusic} ></BattleWindow>} 
  </section>
  </>
})