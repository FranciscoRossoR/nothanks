import React, { useRef } from 'react';

import { observer } from 'mobx-react';
import {
    Button, Box, Center,
    Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody,
    Flex, useDimensions, useDisclosure, HStack
} from '@chakra-ui/react';

import gameState, { callUpdateDeck, callUpdatePlayers, callUpdateStatus, callUpdateTurn, callUpdatePool } from 'pages/store';

import NoThanksPlayer from 'src/entities/nothanks/player';
import { chipType } from 'src/entities/nothanks/common'

import PlayerProfile from 'src/components/PlayerProfile';
import MiniPlayerProfile from 'src/components/MiniPlayerProfile';
import Player from 'framework/entities/player';
import { reaction } from 'mobx';


export interface IPanelProps {
}

function onAddPlayer(event: React.MouseEvent<HTMLButtonElement>) {
    gameState.addPlayer("Player " + (gameState.players.length + 1));
    callUpdatePlayers(gameState.players);
}

function onStart(event: React.MouseEvent<HTMLButtonElement>) {
    gameState.startGame();
    callUpdateDeck(gameState.deck);
}

export default observer(function SummaryPanel(props: IPanelProps) {
    const boxRef = useRef(null);
    const dimensions = useDimensions(boxRef, true);
    const isMiniVersion = dimensions && dimensions.borderBox.width < 190 * gameState.players.length;
    const sticky = {
        position: "sticky",
        width: "full",
        bottom: "0",
    }
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box ref={boxRef} __css={isMiniVersion ? sticky : {}} bgColor="brand.50">
            <Flex bgColor="brand.50" justifyContent="center">
                {gameState.players.map((p: Player, index: number) => {
                    const ntp = p as NoThanksPlayer;
                    const chips = ntp._pool.getResources(chipType) || 0;
                    const isCurrent = gameState.whoisturn === index;
                    const info = new Map<string, string>().
                        set("Score", ntp.score.toString()).
                        set("Chips", chips.toString());
                    return (
                        isMiniVersion
                            ? <MiniPlayerProfile m="2px" key={"MiniPlayerProfile" + p.name} name={p.name} color={p.color} info={info} active={isCurrent} />
                            : <PlayerProfile m="10px" key={"PlayerProfile" + p.name} name={p.name} color={p.color} info={info} active={isCurrent} />
                    )
                })
                }
            </Flex>
            {gameState.status === "open" ?
                <Center>
                    <HStack p="1em" spacing="1em">
                        {!!!gameState.isMaxPlayersReached ? <>
                            <Button bgColor="brand.500" onClick={(e) => { onAddPlayer(e) }}>Add player</Button>
                            <NewPlayerDrawer isOpen={isOpen} onClose={onClose} /></>
                            : null
                        }
                        {gameState.enoughPlayers ?
                            <Button bgColor="brand.500" onClick={(e) => { onStart(e) }}>Start</Button>
                            : null}
                    </HStack>
                </Center>
                : null}

        </Box>
    )
}
)

interface IDrawerProps {
    onClose: () => void,
    isOpen: boolean,
}

function NewPlayerDrawer(props: IDrawerProps) {
    const { onClose, isOpen } = props;
    return (
        <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerBody>
                    Probando
                </DrawerBody>
            </DrawerContent>

        </Drawer>
    );
}

// Sync GameState

reaction(() => gameState.status, () => { callUpdateStatus(
    gameState.status
    , gameState.players
)});

reaction(() => gameState.whoisturn, () => { callUpdateTurn(
    gameState.whoisturn
    , gameState.players
    , gameState.deck
)});

reaction(() => gameState.pool._pool.get('chips'), () => { callUpdatePool(
    gameState.pool
    , gameState.players
    , gameState.deck
)});