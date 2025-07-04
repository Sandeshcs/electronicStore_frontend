import { createContext, useContext } from "react";

const ElectronicStoreContext = createContext();
export default ElectronicStoreContext;

export function useElectronicStoreContext(){ useContext(ElectronicStoreContext)};

export function ElectronicStoreContextProvider({children}){
    const a = 10;
    console.log(children)
    return(
        <div>
            <ElectronicStoreContext.Provider value={{a}}>
                {children}
            </ElectronicStoreContext.Provider>
        </div>
    )
}