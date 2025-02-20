import react, {useState,useRef,useEffect} from 'react'



export default function UseNearScreen({distance = '100px', externalRef, once = true} = {}){
    let observer
    const [isNearScreen, setNearScreen] = useState(false)
    const elementRef = useRef()
    const finalRef = externalRef ? externalRef.current : elementRef.current
    useEffect(function(){
     const onChange = (entries,observer) =>{          
         const el = entries[0]
         if(el.isIntersecting){
             setNearScreen(true)
             once && observer.disconnect()
             console.log("working")    
         } else {
            setNearScreen(false)
            !once && setNearScreen(false)
        }
     }
   
     Promise.resolve(
        typeof IntersectionObserver !== 'undefined'
        ? IntersectionObserver 
        : import('intersection-observer')
     ).then(()=>{
         observer = new IntersectionObserver(onChange,{rootMargin: distance})
         if(finalRef){observer.observe(finalRef)}
     })
     return () => observer && observer.disconnect()
 })
      return {isNearScreen, elementRef}
}