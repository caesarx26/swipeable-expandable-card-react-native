import { SheetManager } from 'react-native-actions-sheet';
import { useEffect } from 'react';

const Message = () => {
    useEffect(() => {
        SheetManager.show('custom-sheet');
    }, []);

    return <>
    </>;
};


export default Message;
