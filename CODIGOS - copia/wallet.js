// Función para conectar wallet con MetaMask
async function connectWallet() {
    if (!window.ethereum) {
        alert('Por favor instala MetaMask para conectar tu wallet');
        window.open('https://metamask.io/', '_blank');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        // Guardar la cuenta en localStorage
        localStorage.setItem('userWallet', account);
        
        // Actualizar UI
        updateWalletUI(account);
        
        // Obtener balance
        const balance = await getWalletBalance(account);
        console.log('Balance:', balance);
        
        return account;
    } catch (error) {
        console.error('Error al conectar wallet:', error);
        alert('Error al conectar la wallet');
    }
}

// Función para obtener el balance de la wallet
async function getWalletBalance(address) {
    if (!window.ethereum) return;
    
    try {
        const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
        });
        
        // Convertir de Wei a ETH
        const ethBalance = parseInt(balance, 16) / 1e18;
        return ethBalance;
    } catch (error) {
        console.error('Error al obtener balance:', error);
    }
}

// Función para actualizar la UI con la wallet conectada
function updateWalletUI(account) {
    const walletBtn = document.getElementById('walletBtn');
    const shortAddress = account.substring(0, 6) + '...' + account.substring(account.length - 4);
    
    walletBtn.textContent = shortAddress;
    walletBtn.className = 'wallet-btn connected';
    walletBtn.onclick = disconnectWallet;
}

// Función para desconectar wallet
function disconnectWallet() {
    localStorage.removeItem('userWallet');
    const walletBtn = document.getElementById('walletBtn');
    walletBtn.textContent = 'Conectar Wallet';
    walletBtn.className = 'wallet-btn';
    walletBtn.onclick = connectWallet;
}

// Función para procesar compra con criptomonedas
async function purchaseWithCrypto(productName, priceETH) {
    const userWallet = localStorage.getItem('userWallet');
    
    if (!userWallet) {
        alert('Por favor conecta tu wallet primero');
        await connectWallet();
        return;
    }

    // Simular transacción
    const transactionData = {
        from: userWallet,
        to: '0x1234567890123456789012345678901234567890', // Dirección de comerciante (simulada)
        value: (priceETH * 1e18).toString(),
        product: productName,
        timestamp: new Date().toISOString()
    };

    console.log('Datos de transacción:', transactionData);

    // Mostrar diálogo de confirmación
    const confirmPurchase = confirm(
        `Confirmar compra de ${productName}\nPrecio: ${priceETH} ETH\nWallet: ${userWallet}\n\nEsta es una demostración. En producción se procesaría la transacción real.`
    );

    if (confirmPurchase) {
        // Simulación de transacción exitosa
        alert(`¡Compra simulada exitosa!\n\nProducto: ${productName}\nPrecio: ${priceETH} ETH\nWallet: ${userWallet}\n\nEn un entorno de producción, se procesaría la transacción en la blockchain.`);
        
        // Guardar en localStorage para registro
        const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        purchases.push(transactionData);
        localStorage.setItem('purchases', JSON.stringify(purchases));
        
        return true;
    }
    return false;
}

// Verificar wallet conectada al cargar la página
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('userWallet');
    if (savedWallet) {
        updateWalletUI(savedWallet);
    }
});

// Escuchar cambios en MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else if (accounts[0] !== localStorage.getItem('userWallet')) {
            localStorage.setItem('userWallet', accounts[0]);
            updateWalletUI(accounts[0]);
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}
