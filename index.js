import { ethers } from "./ethers-5.2.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("ConnectButton");
const fundButton = document.getElementById("FundMe");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const view = document.getElementById("ViewingWindow");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;


async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        view.innerHTML = "Connected!";
        connectButton.innerHTML = "Connected";
        connectButton.style = "color:white; font-size: 30px; background-color:transparent; border:none;"
    } else {
        console.log("No metamask");
        connectButton.innerHTML = "Please install a metamask";
    }
}


//fund function

async function fund() {

    const ethAmount = document.getElementById("ethAmount").value;
    view.innerText = (`Funding with ${ethAmount}`);

    if (typeof window.ethereum !== "undefined") {

        //provider/connection to the blockchain
        //signer/wallet/someone with some gas
        //contract that we are interacting with
        // ABI & address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(); // this line will get the wallet we are using 
        console.log(signer);

        // now getting the abi and the contract
        const contract = new ethers.Contract(contractAddress, abi, signer);

        //now we have the contract we can make the transcation as it hsould be
        try {
            const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) });

            //listen to the tx to be mined
            // listed for an event
            await listenForTransactionMine(transactionResponse, provider);
            view.innerHTML = ("Done");

        } catch (e) {
            console.log(e);
        }
    }
}

function listenForTransactionMine(transcationResponse, provider) {
    console.log(`Mining ${transcationResponse.hash}....`);

    return new Promise((resolve, reject) => {
        provider.once(transcationResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
            resolve();
        })
    })

}


//getBalance Function

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);

        //console.log(ethers.utils.formatEther(balance));

        view.innerHTML = (`Balance: ${ethers.utils.formatEther(balance)}`);
    }
}

//withdraw function
async function withdraw() {
    view.innerHTML = (`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            // await transactionResponse.wait(1)
            view.innerHTML = "Done withdrawing. Please check your wallet balance!"
        } catch (error) {
            console.log(error)
        }
    } else {
        withdrawButton.innerHTML = "Please install MetaMask"
    }
}


