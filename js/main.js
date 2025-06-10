    // Глобальные переменные
    let currentTrack = null;
    let audioPlayer = null;
    let isPlaying = false;
    let volume = 1.0;
    let mediaSession = null;
    let queue = [];
    let contextMenu = null;
    let contextMenuTrack = null;
    let currentLyrics = null;
    let lyricsInterval = null;

    // Глобальные переменные для эквалайзера
    let audioContext = null;
    let audioSource = null;
    let equalizer = null;
    let equalizerFilters = [];
    let currentPreset = 'flat';
    let equalizerEnabled = true;
    let preampNode = null;

    // Константы для эквалайзера
    const EQUALIZER_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    const EQUALIZER_PRESETS = {
        flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bass: [6, 4, 2, 0, -2, -4, -4, -4, -4, -4],
        treble: [-4, -4, -4, -4, -2, 0, 2, 4, 6, 6],
        vocal: [-2, -2, 0, 2, 4, 4, 2, 0, -2, -2],
        rock: [4, 2, 0, -2, -2, 0, 2, 4, 4, 4],
        pop: [2, 2, 0, 0, 0, 0, 2, 2, 2, 2],
        jazz: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        classic: [-2, -2, -2, -2, 0, 0, 2, 2, 2, 2],
        electronic: [4, 4, 2, 0, -2, -2, 0, 2, 4, 4],
        hiphop: [6, 6, 4, 2, 0, -2, -2, -2, -2, -2]
    };

    // Добавляем поддержку PWA
    if ('serviceWorker' in navigator) {
        $(window).on('load', () => {
            navigator.serviceWorker.register('/static/sw.js')
                .then(registration => {
                    console.log('ServiceWorker зарегистрирован:', registration);
                })
                .catch(error => {
                    console.log('Ошибка регистрации ServiceWorker:', error);
                });
        });
    }

    // Добавляем мета-теги для PWA
    const metaTags = `
        <link rel="manifest" href="/static/manifest.json">
        <meta name="theme-color" content="#1DB954">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <meta name="apple-mobile-web-app-title" content="Spotify Clone">
        <link rel="apple-touch-icon" href="/static/icons/icon-192x192.png">
    `;
    $('head').append(metaTags);

    // Функции для работы с локальным хранилищем
    function savePlayerState() {
        if (!audioPlayer) return;

        const state = {
            volume: audioPlayer.volume,
            isPlaying: isPlaying,
            currentTrackId: currentTrack,
            currentTime: audioPlayer.currentTime,
            queue: queue
        };

        localStorage.setItem('playerState', JSON.stringify(state));
    }

    function loadPlayerState() {
        const savedState = localStorage.getItem('playerState');
        if (!savedState || !audioPlayer) return;

        try {
            const state = JSON.parse(savedState);
            
            // Восстанавливаем громкость
            volume = state.volume || 1.0;
            audioPlayer.volume = volume;
            $('#volume-level').css('width', `${volume * 100}%`);
            updateVolumeIcon();

            // Восстанавливаем очередь
            if (state.queue) {
                queue = state.queue;
                updateQueueList();
            }

            // Восстанавливаем трек
            if (state.currentTrackId) {
                currentTrack = state.currentTrackId;
                // Получаем информацию о треке
                $.get(`/api/track/${state.currentTrackId}`)
                    .done(trackInfo => {
                        // Обновляем информацию о треке
                        $('#now-playing-title').text(trackInfo.title);
                        $('#now-playing-artist').text(trackInfo.artist);
                        $('#now-playing-cover').attr('src', trackInfo.thumbnail);

                        // Обновляем ссылку на артиста
                        if (trackInfo.artist_id) {
                            $('#now-playing-artist').attr('href', `/artists/${trackInfo.artist_id}`);
                        } else {
                            $('#now-playing-artist').attr('href', '#');
                        }

                        if (mediaSession) {
                            mediaSession.metadata = new MediaMetadata({
                                title: trackInfo.title,
                                artist: trackInfo.artist,
                                album: 'Music Player',
                                artwork: [
                                    { src: trackInfo.thumbnail, sizes: '512x512', type: 'image/jpeg' }
                                ]
                            });
                        }

                        // Загружаем трек
                        $.get(`/api/stream/${state.currentTrackId}/status`)
                            .done(data => {
                                if (data.status === 'ready') {
                                    audioPlayer.src = `/api/stream/${state.currentTrackId}`;
                                    audioPlayer.currentTime = state.currentTime || 0;
                                    
                                    if (state.isPlaying) {
                                        audioPlayer.play()
                                            .then(() => {
                                                isPlaying = true;
                                                updatePlayButton();
                                            })
                                            .catch(error => {
                                                console.error('Ошибка воспроизведения:', error);
                                                isPlaying = false;
                                                updatePlayButton();
                                            });
                                    }
                                }
                            })
                            .fail(error => {
                                console.error('Ошибка проверки статуса трека:', error);
                            });
                    })
                    .fail(error => {
                        console.error('Ошибка получения информации о треке:', error);
                    });
            }

        } catch (error) {
            console.error('Ошибка при загрузке состояния:', error);
        }
    }

    // Инициализация плеера
    $(document).ready(function() {
        // Создаем аудио элемент
        audioPlayer = new Audio();
        updateAudioSource(audioPlayer);
        
        // Загружаем сохраненное состояние
        loadPlayerState();

        // Инициализация MediaSession API
        if ('mediaSession' in navigator) {
            mediaSession = navigator.mediaSession;
            
            mediaSession.setActionHandler('play', () => {
                if (audioPlayer) {
                    audioPlayer.play();
                    isPlaying = true;
                    updatePlayButton();
                    savePlayerState();
                }
            });
            mediaSession.setActionHandler('pause', () => {
                if (audioPlayer) {
                    audioPlayer.pause();
                    isPlaying = false;
                    updatePlayButton();
                    savePlayerState();
                }
            });
            mediaSession.setActionHandler('previoustrack', playPrevious);
            mediaSession.setActionHandler('nexttrack', playNext);
            mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime && audioPlayer) {
                    audioPlayer.currentTime = details.seekTime;
                    savePlayerState();
                }
            });
        }

        // Обработчики событий для аудио
        $(audioPlayer).on('timeupdate', () => {
            updateProgress();
            savePlayerState();
        });
        $(audioPlayer).on('ended', handleTrackEnd);
        $(audioPlayer).on('error', handleAudioError);
        $(audioPlayer).on('play', () => {
            isPlaying = true;
            updatePlayButton();
            if (mediaSession) {
                mediaSession.playbackState = 'playing';
            }
            savePlayerState();
        });
        $(audioPlayer).on('pause', () => {
            isPlaying = false;
            updatePlayButton();
            if (mediaSession) {
                mediaSession.playbackState = 'paused';
            }
            savePlayerState();
        });

        // Сохраняем состояние при закрытии страницы
        $(window).on('beforeunload', savePlayerState);

        // Обработчики для кнопок управления
        $('#play-button').on('click', togglePlay);
        $('#prev-button').on('click', playPrevious);
        $('#next-button').on('click', playNext);
        $('#volume-button').on('click', toggleMute);
        $('#volume-slider').on('click', handleVolumeChange);
        $('#progress-container').on('click', handleProgressClick);

        // Обработчик для треков
        $(document).on('click', '.track-item', function() {
            const trackId = $(this).data('id');
            if (trackId) {
                playTrack(trackId);
            }
        });

        // Обработчик для кнопки перемотки назад
        $('#rewind-button').on('click', () => {
            if (audioPlayer) {
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
            }
        });

        // Обработчик для кнопки перемотки вперед
        $('#forward-button').on('click', () => {
            if (audioPlayer) {
                audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
            }
        });

        // Обработчик для кнопки повтора
        $('#repeat-button').on('click', () => {
            if (audioPlayer) {
                audioPlayer.loop = !audioPlayer.loop;
                $('#repeat-button').toggleClass('text-spotify-green');
            }
        });

        // Обработчик для кнопки случайного воспроизведения
        $('#shuffle-button').on('click', () => {
            $('#shuffle-button').toggleClass('text-spotify-green');
        });

        // Инициализация контекстного меню
        contextMenu = $('#context-menu');
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#context-menu').length) {
                contextMenu.addClass('hidden');
            }
        });

        // Обработка клика правой кнопкой мыши
        $(document).on('contextmenu', function(e) {
            const $trackItem = $(e.target).closest('.track-item');
            if ($trackItem.length) {
                e.preventDefault();
                contextMenuTrack = $trackItem; // Сохраняем jQuery объект
                
                const $menu = $('#context-menu');
                $menu.removeClass('hidden');
                
                // Получаем размеры меню и окна
                const menuRect = $menu[0].getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                // Вычисляем позицию
                let left = e.clientX;
                let top = e.clientY;
                
                // Проверяем, не выходит ли меню за пределы экрана справа
                if (left + menuRect.width > windowWidth) {
                    left = windowWidth - menuRect.width - 10;
                }
                
                // Проверяем, не выходит ли меню за пределы экрана снизу
                if (top + menuRect.height > windowHeight) {
                    top = windowHeight - menuRect.height - 10;
                }
                
                // Устанавливаем позицию
                $menu.css({
                    left: `${left}px`,
                    top: `${top}px`
                });
            }
        });

        // Закрытие контекстного меню
        function closeContextMenu() {
            contextMenu.addClass('hidden');
            contextMenuTrack = null;
        }

        // Закрытие по клику вне меню
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#context-menu').length) {
                closeContextMenu();
            }
        });

        // Закрытие по Escape
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                closeContextMenu();
            }
        });

        // Обработчики для контекстного меню
        $('#context-menu button').on('click', function() {
            const action = $(this).data('action');
            if (contextMenuTrack) {
                const trackId = contextMenuTrack.data('id');
                switch (action) {
                    case 'play':
                        playTrack(trackId);
                        break;
                    case 'add-to-queue':
                        addToQueue(contextMenuTrack[0]);
                        break;
                    case 'play-next':
                        addToQueue(contextMenuTrack[0], true);
                        break;
                }
            }
            closeContextMenu();
        });

        // Обработчик для кнопки очереди
        $('#queue-button, #close-queue').on('click', toggleQueue);

        // Обработчики для текста песни
        $('#lyrics-button, #close-lyrics').on('click', toggleLyrics);

        // Добавляем обработчики событий для эквалайзера
        $(document).ready(function() {
            // Обработчик кнопки эквалайзера
            $('#equalizer-button').on('click', function() {
                toggleEqualizer();
            });

            // Инициализация эквалайзера при первом воспроизведении
            $(audioPlayer).on('play', function() {
                if (!audioContext) {
                    initEqualizer();
                }
            });
        });
    });

    // Воспроизведение трека
    function playTrack(trackId) {
        try {
            // Получаем информацию о треке через API
            $.get(`/api/track/${trackId}`)
                .done(trackInfo => {
                    // Обновляем интерфейс
                    $('#now-playing-title').text(trackInfo.title);
                    $('#now-playing-artist').text(trackInfo.artist);
                    $('#now-playing-cover').attr('src', trackInfo.thumbnail);

                    // Обновляем ссылку на артиста
                    if (trackInfo.artist_id) {
                        $('#now-playing-artist').attr('href', `/artists/${trackInfo.artist_id}`);
                    } else {
                        $('#now-playing-artist').attr('href', '#');
                    }

                    if (mediaSession) {
                        mediaSession.metadata = new MediaMetadata({
                            title: trackInfo.title,
                            artist: trackInfo.artist,
                            album: 'Music Player',
                            artwork: [
                                { src: trackInfo.thumbnail, sizes: '512x512', type: 'image/jpeg' }
                            ]
                        });
                    }
                          // Сохраняем трек в историю прослушивания с полной информацией
                          savePlayedTrack(trackId, trackInfo);
                    // Проверяем готовность трека
                    $.get(`/api/stream/${trackId}/status`)
                        .done(data => {
                            if (data.status === 'ready') {
                                audioPlayer.src = `/api/stream/${trackId}`;
                                audioPlayer.play()
                                    .then(() => {
                                        isPlaying = true;
                                        updatePlayButton();
                                        currentTrack = trackId;
                                        savePlayerState();
                                  
                                    })
                                    .catch(error => {
                                        console.error('Ошибка воспроизведения:', error);
                                        showError('Не удалось воспроизвести трек');
                                    });
                            } else {
                                // Если трек не готов, отправляем запрос на стрим для начала загрузки
                                $.get(`/api/stream/${trackId}`)
                                    .done(() => {
                                        showError('Трек загружается, пожалуйста подождите...');
                                        setTimeout(() => playTrack(trackId), 5000);
                                    })
                                    .fail(error => {
                                        console.error('Ошибка при загрузке трека:', error);
                                        showError('Не удалось начать загрузку трека');
                                    });
                            }
                        })
                        .fail(error => {
                            console.error('Ошибка проверки статуса трека:', error);
                            showError('Ошибка при проверке статуса трека');
                        });
                })
                .fail(error => {
                    console.error('Ошибка получения информации о треке:', error);
                    showError('Не удалось получить информацию о треке');
                });

            if (!$('#lyrics-container').hasClass('hidden')) {
                loadLyrics(trackId);
            }

        } catch (error) {
            console.error('Ошибка при воспроизведении трека:', error);
            showError('Произошла ошибка при воспроизведении трека');
        }
    }

    // Переключение воспроизведения
    function togglePlay() {
        try {
            if (!audioPlayer.src) return;

            if (isPlaying) {
                audioPlayer.pause();
            } else {
                audioPlayer.play();
            }
            isPlaying = !isPlaying;
            updatePlayButton();
        } catch (error) {
            console.error('Ошибка при переключении воспроизведения:', error);
            showError('Не удалось переключить воспроизведение');
        }
    }

    // Обновление кнопки воспроизведения
    function updatePlayButton() {
        const playButton = document.getElementById('play-button');
        const icon = playButton.querySelector('i');
        
        if (isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    }

    // Обновление прогресса
    function updateProgress() {
        try {
            const progressBar = document.getElementById('progress-bar');
            const currentTime = document.getElementById('current-time');
            const duration = document.getElementById('duration');

            if (audioPlayer.duration) {
                const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                progressBar.style.width = `${progress}%`;
                
                currentTime.textContent = formatTime(audioPlayer.currentTime);
                duration.textContent = formatTime(audioPlayer.duration);
            }
        } catch (error) {
            console.error('Ошибка при обновлении прогресса:', error);
        }
    }

    // Обработка клика по прогресс-бару
    function handleProgressClick(e) {
        try {
            const progressContainer = document.getElementById('progress-container');
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = pos * audioPlayer.duration;
        } catch (error) {
            console.error('Ошибка при изменении прогресса:', error);
        }
    }

    // Обработка изменения громкости
    function handleVolumeChange(e) {
        try {
            const volumeSlider = document.getElementById('volume-slider');
            const rect = volumeSlider.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            volume = Math.max(0, Math.min(1, pos));
            
            audioPlayer.volume = volume;
            document.getElementById('volume-level').style.width = `${volume * 100}%`;
            updateVolumeIcon();
            savePlayerState();
        } catch (error) {
            console.error('Ошибка при изменении громкости:', error);
        }
    }

    // Переключение звука
    function toggleMute() {
        try {
            if (audioPlayer.volume > 0) {
                audioPlayer.volume = 0;
                $('#volume-level').css('width', '0%');
            } else {
                audioPlayer.volume = volume;
                $('#volume-level').css('width', `${volume * 100}%`);
            }
            updateVolumeIcon();
        } catch (error) {
            console.error('Ошибка при переключении звука:', error);
        }
    }

    // Обновление иконки громкости
    function updateVolumeIcon() {
        const $icon = $('#volume-button i');
        
        if (audioPlayer.volume === 0) {
            $icon.removeClass('fa-volume-up fa-volume-down').addClass('fa-volume-mute');
        } else if (audioPlayer.volume < 0.5) {
            $icon.removeClass('fa-volume-up fa-volume-mute').addClass('fa-volume-down');
        } else {
            $icon.removeClass('fa-volume-down fa-volume-mute').addClass('fa-volume-up');
        }
    }

    // Обработка окончания трека
    function handleTrackEnd() {
        isPlaying = false;
        updatePlayButton();
        playNext();
    }

    // Воспроизведение следующего трека
    function playNext() {
        if (queue.length > 0) {
            const nextTrack = queue.shift();
            const $trackElement = $(`.track-item[data-id="${nextTrack.id}"]`);
            
            if ($trackElement.length) {
                playTrack(nextTrack.id);
            } else {
                const $tempElement = $('<div>').html(`
                    <div class="track-item" data-id="${nextTrack.id}">
                        <div class="track-title">${nextTrack.title}</div>
                        <div class="track-artist">${nextTrack.artist}</div>
                        <img src="${nextTrack.cover}" alt="${nextTrack.title}">
                    </div>
                `);
                playTrack(nextTrack.id);
            }
            updateQueueList();
        } else {
            const $currentTrackElement = $(`.track-item[data-id="${currentTrack}"]`);
            if ($currentTrackElement.length) {
                const $nextTrack = $currentTrackElement.next('.track-item');
                if ($nextTrack.length) {
                    const trackId = $nextTrack.data('id');
                    if (trackId) {
                        playTrack(trackId);
                    }
                }
            }
        }
    }

    // Воспроизведение предыдущего трека
    function playPrevious() {
        if (currentTrack) {
            const $currentTrackElement = $(`.track-item[data-id="${currentTrack}"]`);
            if ($currentTrackElement.length) {
                const track = {
                    id: currentTrack,
                    title: $currentTrackElement.find('.track-title, .font-semibold').text(),
                    artist: $currentTrackElement.find('.track-artist, .text-spotify-gray').text(),
                    cover: $currentTrackElement.find('img').attr('src')
                };
                queue.unshift(track);
            }

            const $prevTrack = $currentTrackElement.prev('.track-item');
            if ($prevTrack.length) {
                const trackId = $prevTrack.data('id');
                if (trackId) {
                    playTrack(trackId);
                }
            }
            updateQueueList();
        }
    }

    // Обработка ошибок аудио
    function handleAudioError(error) {
        console.error('Ошибка аудио:', error);
        showError('Произошла ошибка при воспроизведении трека');
        isPlaying = false;
        updatePlayButton();
    }

    // Форматирование времени
    function formatTime(seconds) {
        try {
            if (isNaN(seconds)) return '0:00';
            
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('Ошибка при форматировании времени:', error);
            return '0:00';
        }
    }

    // Показ ошибки
    function showError(message) {
        const $errorElement = $('<div>')
            .addClass('fixed top-4 right-4 glass px-6 py-3 rounded-lg text-white z-50')
            .text(message)
            .appendTo('body');
        
        setTimeout(() => {
            $errorElement.remove();
        }, 3000);
    }

    // Функции для работы с очередью
    function addToQueue(trackElement, playNext = false) {
        const $trackElement = $(trackElement);
        const track = {
            id: $trackElement.data('id'),
            title: $trackElement.find('.track-title, .font-semibold').text(),
            artist: $trackElement.find('.track-artist, .text-spotify-gray').text(),
            cover: $trackElement.find('img').attr('src')
        };

        if (playNext) {
            queue.unshift(track);
        } else {
            queue.push(track);
        }

        updateQueueList();
        showError('Трек добавлен в очередь');
    }

    function updateQueueList() {
        const $queueList = $('#queue-list');
        $queueList.html(queue.map((track, index) => `
            <div class="flex items-center gap-4 p-2 hover:bg-spotify-light/50 rounded-lg cursor-pointer ${track.id === currentTrack ? 'bg-spotify-light/30' : ''}" 
                 data-id="${track.id}" 
                 onclick="playTrack('${track.id}')">
                <img src="${track.cover}" alt="${track.title}" class="w-10 h-10 rounded">
                <div class="flex-1">
                    <div class="font-semibold">${track.title}</div>
                    <div class="text-spotify-gray text-sm">${track.artist}</div>
                </div>
                <button class="text-spotify-gray hover:text-white" onclick="removeFromQueue(${index}, event)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join(''));
    }

    function removeFromQueue(index, event) {
        event.stopPropagation();
        queue.splice(index, 1);
        updateQueueList();
    }

    // Функция переключения очереди
    function toggleQueue() {
        const $queueContainer = $('#queue-container');
        const isVisible = !$queueContainer.hasClass('hidden');
        
        if (isVisible) {
            $queueContainer.addClass('translate-y-full');
            setTimeout(() => {
                $queueContainer.addClass('hidden');
            }, 300);
        } else {
            $queueContainer.removeClass('hidden');
            requestAnimationFrame(() => {
                $queueContainer.removeClass('translate-y-full');
            });
        }
    }

    // Функция переключения текста песни
    function toggleLyrics() {
        const $lyricsContainer = $('#lyrics-container');
        const isVisible = !$lyricsContainer.hasClass('hidden');
        
        if (isVisible) {
            $lyricsContainer.addClass('translate-y-full');
            setTimeout(() => {
                $lyricsContainer.addClass('hidden');
            }, 300);

            if (lyricsInterval) {
                clearInterval(lyricsInterval);
                lyricsInterval = null;
            }
        } else {
            $lyricsContainer.removeClass('hidden');
            requestAnimationFrame(() => {
                $lyricsContainer.removeClass('translate-y-full');
            });

            if (currentTrack) {
                loadLyrics(currentTrack);
            }
        }
    }

    // Функция загрузки текста песни
    function loadLyrics(trackId) {
        const $lyricsContent = $('#lyrics-content');
        $lyricsContent.html('<div class="text-spotify-gray">Загрузка текста...</div>');

        $.get(`/api/lyrics/${trackId}`)
            .done(function(data) {
                if (data.error) {
                    $lyricsContent.html(`<div class="text-spotify-gray">${data.error}</div>`);
                    return;
                }

                currentLyrics = {
                    lines: data.lyrics.lyrics.map(line => line.text),
                    timestamps: data.lyrics.lyrics.map(line => line.start_time / 1000),
                    title: data.title
                };

                // Отображаем текст
                $lyricsContent.html(`
                    <div class="text-2xl font-semibold mb-8 mt-16">${data.title}</div>
                    <div class="space-y-6 max-w-3xl mx-auto text-center">
                        ${currentLyrics.lines.map((line, index) => `
                            <p class="text-spotify-gray transition-all duration-300 transform hover:scale-105 cursor-pointer text-xl" 
                               data-timestamp="${currentLyrics.timestamps[index]}"
                               data-index="${index}">
                                ${line}
                            </p>
                        `).join('')}
                    </div>
                `);

                // Запускаем обновление текущей строки
                if (lyricsInterval) {
                    clearInterval(lyricsInterval);
                }
                lyricsInterval = setInterval(updateCurrentLyricLine, 100);
            })
            .fail(function(error) {
                console.error('Ошибка при загрузке текста:', error);
                $lyricsContent.html('<div class="text-spotify-gray">Не удалось загрузить текст песни</div>');
            });
    }

    // Функция обновления текущей строки
    function updateCurrentLyricLine() {
        if (!currentLyrics || !audioPlayer) return;

        const currentTime = audioPlayer.currentTime;
        const $lines = $('#lyrics-content p[data-timestamp]');
        
        // Находим текущую строку
        let currentLineIndex = -1;
        for (let i = 0; i < currentLyrics.timestamps.length; i++) {
            const timestamp = currentLyrics.timestamps[i];
            if (timestamp <= currentTime) {
                currentLineIndex = i;
            } else {
                break;
            }
        }

        // Обновляем стили
        $lines.each(function(index) {
            const $line = $(this);
            if (index === currentLineIndex) {
                $line.removeClass('text-spotify-gray')
                     .addClass('text-white text-3xl font-semibold scale-110');
                // Плавная прокрутка к текущей строке
                $line[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                $line.removeClass('text-white text-3xl font-semibold scale-110')
                     .addClass('text-spotify-gray text-xl');
            }
        });
    }

    // Добавляем обработчик клика по строкам текста
    $(document).on('click', '#lyrics-content p[data-timestamp]', function() {
        const timestamp = $(this).data('timestamp');
        if (timestamp && audioPlayer) {
            audioPlayer.currentTime = timestamp;
        }
    });

    // Добавляем функцию для получения истории воспроизведения
    function getLastPlayedTracks() {
        return JSON.parse(localStorage.getItem('lastPlayedTracks') || '[]');
    }

    // Добавляем функцию для очистки истории
    function clearPlayHistory() {
        localStorage.removeItem('lastPlayedTracks');
        savePlayerState();
    }

    // Функции для работы с авторизацией
    function getAccessToken() {
        return localStorage.getItem('access_token');
    }

    function getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    function removeTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
    }

    function isTokenExpired() {
        const expiresAt = localStorage.getItem('token_expires_at');
        if (!expiresAt) return true;
        return new Date(expiresAt) <= new Date();
    }

    function saveTokens(tokens) {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('token_expires_at', tokens.expires_at);
    }

    function refreshTokens() {
        return $.ajax({
            url: '/api/auth/refresh',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                refresh_token: getRefreshToken()
            })
        });
    }

    // Функция для загрузки подписок на исполнителей в сайдбар
    function loadFollowedArtistsSidebar() {
        $.ajax({
            url: '/api/user/followed-artists',
            method: 'GET',
            success: function(response) {
                const sidebar = $('#followed-artists-sidebar');
                sidebar.empty();

                if (response.artists.length === 0) {
                    sidebar.append(`
                        <div class="px-4 py-2 text-spotify-gray text-sm">
                            Нет подписок
                        </div>
                    `);
                    return;
                }

                response.artists.forEach(function(artist) {
                    const artistElement = $(`
                        <a href="/artists/${artist.artist_id}" 
                           class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-spotify-light/50 group">
                            <img src="${artist.image}" alt="${artist.name}" class="w-8 h-8 rounded-full object-cover">
                            <span class="text-spotify-gray group-hover:text-white transition-colors">${artist.name}</span>
                        </a>
                    `);
                    sidebar.append(artistElement);
                });
            },
            error: function() {
                $('#followed-artists-sidebar').html(`
                    <div class="px-4 py-2 text-spotify-gray text-sm">
                        Ошибка загрузки
                    </div>
                `);
            }
        });
    }

    // Функция для обновления интерфейса после авторизации
    function updateUIAfterAuth(user) {
        $('#auth-buttons').addClass('hidden');
        $('#user-menu-content').removeClass('hidden');
        $('#user-name').text(user.name);
        $('#u-avatar').text(user.name[0].toUpperCase());
        
        // Загружаем подписки в сайдбар
        loadFollowedArtistsSidebar();
    }

    // Функция для обновления интерфейса после выхода
    function updateUIAfterLogout() {
        $('#user-menu-content').addClass('hidden');
        $('#auth-buttons').removeClass('hidden');
        $('#user-menu-dropdown').addClass('hidden');
    }

    // Функции для работы с модальными окнами
    function showModal(modalId) {
        $(`#${modalId}`).fadeIn(200);
    }

    function hideModal(modalId) {
        $(`#${modalId}`).fadeOut(200);
    }

    function showError(inputId, message) {
        $(`#${inputId}-error`).text(message).show();
    }

    function hideError(inputId) {
        $(`#${inputId}-error`).hide();
    }

    // Инициализация обработчиков событий для авторизации
    $(document).ready(function() {
        // Обработчики для модальных окон
        $('#login-button').on('click', () => showModal('login-modal'));
        $('#register-button').on('click', () => showModal('register-modal'));
        $('#show-register').on('click', () => {
            hideModal('login-modal');
            showModal('register-modal');
        });
        $('#show-login').on('click', () => {
            hideModal('register-modal');
            showModal('login-modal');
        });

        // Закрытие модальных окон
        $('#login-modal-close, #register-modal-close').on('click', function() {
            const modalId = $(this).closest('[id$="-modal"]').attr('id');
            hideModal(modalId);
        });

        // Закрытие по клику вне модального окна
        $('.modal-backdrop').on('click', function() {
            const modalId = $(this).parent().attr('id');
            hideModal(modalId);
        });

        // Закрытие по Escape
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                $('[id$="-modal"]').each(function() {
                    if ($(this).is(':visible')) {
                        hideModal($(this).attr('id'));
                    }
                });
            }
        });

        // Обработка формы входа
        $('#login-form').on('submit', function(e) {
            e.preventDefault();
            
            const email = $('#login-email').val();
            const password = $('#login-password').val();

            hideError('login-email');
            hideError('login-password');

            $.ajax({
                url: '/api/auth/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email, password }),
                success: function(response) {
                    saveTokens(response.tokens);
                    updateUIAfterAuth(response.user);
                    hideModal('login-modal');
                    $('#login-form')[0].reset();
                },
                error: function(xhr) {
                    const response = xhr.responseJSON;
                    if (response.error) {
                        showError('login-email', response.error);
                    }
                }
            });
        });

        // Обработка формы регистрации
        $('#register-form').on('submit', function(e) {
            e.preventDefault();
            
            const name = $('#register-name').val();
            const email = $('#register-email').val();
            const password = $('#register-password').val();
            const passwordConfirm = $('#register-password-confirm').val();

            hideError('register-name');
            hideError('register-email');
            hideError('register-password');
            hideError('register-password-confirm');

            if (password !== passwordConfirm) {
                showError('register-password-confirm', 'Пароли не совпадают');
                return;
            }

            $.ajax({
                url: '/api/auth/register',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ name, email, password }),
                success: function(response) {
                    saveTokens(response.tokens);
                    updateUIAfterAuth(response.user);
                    hideModal('register-modal');
                    $('#register-form')[0].reset();
                },
                error: function(xhr) {
                    const response = xhr.responseJSON;
                    if (response.error) {
                        showError('register-email', response.error);
                    }
                }
            });
        });

        // Обработка выхода
        $('#logout-button').on('click', function() {
            $.ajax({
                url: '/api/auth/logout',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                },
                success: function() {
                    removeTokens();
                    updateUIAfterLogout();
                }
            });
        });

        // Обработка меню пользователя
        $('#user-menu-button').on('click', function(e) {
            e.stopPropagation();
            $('#user-menu-dropdown').toggleClass('hidden');
        });

        // Закрытие меню при клике вне его
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#user-menu').length) {
                $('#user-menu-dropdown').addClass('hidden');
            }
        });

        // Предотвращаем закрытие при клике внутри меню
        $('#user-menu-dropdown').on('click', function(e) {
            e.stopPropagation();
        });

        // Проверяем состояние авторизации при загрузке страницы
        if (getAccessToken() && !isTokenExpired()) {
            $.ajax({
                url: '/api/auth/check',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                },
                success: function(response) {
                    if (response.authenticated) {
                        updateUIAfterAuth(response.user);
                    } else {
                        removeTokens();
                        updateUIAfterLogout();
                    }
                },
                error: function() {
                    removeTokens();
                    updateUIAfterLogout();
                }
            });
        } else if (getRefreshToken()) {
            refreshTokens()
                .then(function(response) {
                    saveTokens(response.tokens);
                    return $.ajax({
                        url: '/api/auth/check',
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${response.tokens.access_token}`
                        }
                    });
                })
                .then(function(response) {
                    if (response.authenticated) {
                        updateUIAfterAuth(response.user);
                    } else {
                        removeTokens();
                        updateUIAfterLogout();
                    }
                })
                .catch(function() {
                    removeTokens();
                    updateUIAfterLogout();
                });
        }

        // Добавляем токен ко всем AJAX запросам
        $.ajaxSetup({
            beforeSend: function(xhr) {
                const token = getAccessToken();
                if (token && !isTokenExpired()) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
            },
            error: function(xhr) {
                if (xhr.status === 401 && getRefreshToken()) {
                    refreshTokens()
                        .then(function(response) {
                            saveTokens(response.tokens);
                            const originalRequest = xhr.config;
                            originalRequest.headers['Authorization'] = `Bearer ${response.tokens.access_token}`;
                            return $.ajax(originalRequest);
                        })
                        .catch(function() {
                            removeTokens();
                            updateUIAfterLogout();
                        });
                }
            }
        });
    });

    // Инициализация эквалайзера
    function initEqualizer() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const filters = EQUALIZER_FREQUENCIES.map(freq => {
            const filter = audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });

        // Создаем цепочку фильтров
        filters.reduce((prev, curr) => {
            prev.connect(curr);
            return curr;
        });

        // Подключаем к источнику
        if (audioSource) {
            audioSource.connect(filters[0]);
            filters[filters.length - 1].connect(audioContext.destination);
        }

        return { audioContext, filters };
    }

    // Обновление аудио источника
    function updateAudioSource(source) {
        audioSource = source;
        if (equalizer && equalizer.filters) {
            if (audioSource) {
                audioSource.disconnect();
            }
            audioSource.connect(equalizer.filters[0]);
        }
    }

    // Инициализация UI эквалайзера
    function initEqualizerUI() {
        const container = document.getElementById('equalizer-container');
        const slidersContainer = document.getElementById('equalizer-sliders');
        const template = document.getElementById('equalizer-slider-template');
        const presetSelect = document.getElementById('equalizer-preset');
        const saveButton = document.getElementById('equalizer-save');
        const resetButton = document.getElementById('equalizer-reset');
        const closeButton = document.getElementById('equalizer-close');
        const onButton = document.getElementById('equalizer-on');
        const offButton = document.getElementById('equalizer-off');
        const preampSlider = document.getElementById('preamp-slider');
        const volumeSlider = document.getElementById('equalizer-volume-slider');

        // Создаем ползунки
        EQUALIZER_FREQUENCIES.forEach((freq, index) => {
            const slider = template.content.cloneNode(true);
            const input = slider.querySelector('input');
            const label = slider.querySelector('span:first-of-type');
            const valueDisplay = slider.querySelector('.value-display');
            const indicator = slider.querySelector('.absolute.bottom-0');

            // Форматируем частоту
            label.textContent = freq >= 1000 ? `${freq/1000}k` : freq;

            // Добавляем обработчики событий
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                updateEqualizerValue(index, value);
                valueDisplay.textContent = `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`;
                indicator.style.height = `${((value + 12) / 24) * 100}%`;
                indicator.style.backgroundColor = value > 0 ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 0, 0, 0.2)';
            });

            slidersContainer.appendChild(slider);
        });

        // Обработчик изменения пресета
        presetSelect.addEventListener('change', (e) => {
            applyEqualizerPreset(e.target.value);
        });

        // Обработчик сохранения пресета
        saveButton.addEventListener('click', () => {
            const currentSettings = getCurrentEqualizerSettings();
            const name = prompt('Введите название пресета:');
            if (name) {
                saveEqualizerPreset(name, currentSettings);
                presetSelect.value = 'custom';
            }
        });

        // Обработчик сброса
        resetButton.addEventListener('click', () => {
            applyEqualizerPreset('flat');
            presetSelect.value = 'flat';
        });

        // Обработчик закрытия
        closeButton.addEventListener('click', () => {
            container.classList.add('hidden');
        });

        // Обработчики включения/выключения
        onButton.addEventListener('click', () => {
            onButton.classList.add('hidden');
            offButton.classList.remove('hidden');
            disableEqualizer();
        });

        offButton.addEventListener('click', () => {
            offButton.classList.add('hidden');
            onButton.classList.remove('hidden');
            enableEqualizer();
        });

        // Обработчик предусиления
        preampSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            updatePreamp(value);
            e.target.nextElementSibling.textContent = `${value > 0 ? '+' : ''}${value.toFixed(1)} dB`;
        });

        // Обработчик громкости
        volumeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            updateVolume(value);
            e.target.nextElementSibling.textContent = `${value}%`;
        });

        // Загружаем сохраненные настройки
        loadEqualizerSettings();
    }

    // Обновление значения эквалайзера
    function updateEqualizerValue(index, value) {
        if (equalizer && equalizer.filters && equalizer.filters[index]) {
            equalizer.filters[index].gain.value = value;
        }
    }

    // Применение пресета
    function applyEqualizerPreset(preset) {
        const settings = EQUALIZER_PRESETS[preset] || EQUALIZER_PRESETS.flat;
        const sliders = document.querySelectorAll('#equalizer-sliders input');
        
        sliders.forEach((slider, index) => {
            const value = settings[index];
            slider.value = value;
            const event = new Event('input');
            slider.dispatchEvent(event);
        });
    }

    // Получение текущих настроек
    function getCurrentEqualizerSettings() {
        const sliders = document.querySelectorAll('#equalizer-sliders input');
        return Array.from(sliders).map(slider => parseFloat(slider.value));
    }

    // Сохранение пресета
    function saveEqualizerPreset(name, settings) {
        const presets = JSON.parse(localStorage.getItem('equalizerPresets') || '{}');
        presets[name] = settings;
        localStorage.setItem('equalizerPresets', JSON.stringify(presets));
    }

    // Загрузка настроек
    function loadEqualizerSettings() {
        const settings = JSON.parse(localStorage.getItem('equalizerSettings') || '{}');
        if (settings.sliders) {
            const sliders = document.querySelectorAll('#equalizer-sliders input');
            sliders.forEach((slider, index) => {
                slider.value = settings.sliders[index];
                const event = new Event('input');
                slider.dispatchEvent(event);
            });
        }
        if (settings.preamp !== undefined) {
            const preampSlider = document.getElementById('preamp-slider');
            preampSlider.value = settings.preamp;
            preampSlider.nextElementSibling.textContent = `${settings.preamp > 0 ? '+' : ''}${settings.preamp.toFixed(1)} dB`;
        }
        if (settings.volume !== undefined) {
            const volumeSlider = document.getElementById('equalizer-volume-slider');
            volumeSlider.value = settings.volume;
            volumeSlider.nextElementSibling.textContent = `${settings.volume}%`;
        }
    }

    // Сохранение настроек
    function saveEqualizerSettings() {
        const settings = {
            sliders: getCurrentEqualizerSettings(),
            preamp: parseFloat(document.getElementById('preamp-slider').value),
            volume: parseInt(document.getElementById('equalizer-volume-slider').value)
        };
        localStorage.setItem('equalizerSettings', JSON.stringify(settings));
    }

    // Включение эквалайзера
    function enableEqualizer() {
        if (equalizer && equalizer.filters) {
            equalizer.filters.forEach(filter => {
                filter.disconnect();
            });
            if (audioSource) {
                audioSource.connect(equalizer.filters[0]);
                equalizer.filters[equalizer.filters.length - 1].connect(equalizer.audioContext.destination);
            }
        }
    }

    // Выключение эквалайзера
    function disableEqualizer() {
        if (equalizer && equalizer.filters) {
            equalizer.filters.forEach(filter => {
                filter.disconnect();
            });
            if (audioSource) {
                audioSource.connect(equalizer.audioContext.destination);
            }
        }
    }

    // Обновление предусиления
    function updatePreamp(value) {
        if (equalizer && equalizer.filters) {
            equalizer.filters.forEach(filter => {
                filter.gain.value = value;
            });
        }
    }

    // Обновление громкости
    function updateVolume(value) {
        if (audioSource) {
            audioSource.volume = value / 100;
        }
    }

    // Функция для сохранения прослушанного трека
    function savePlayedTrack(trackId, trackInfo) {
        try {
            // Проверяем, авторизован ли пользователь
            if (!getAccessToken()) {
                console.log('Пользователь не авторизован, история не будет сохранена');
                return;
            }

            // Отправляем запрос на сервер для сохранения в истории
            $.ajax({
                url: '/api/user/history',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    track_id: trackId,
                    title: trackInfo.title,
                    artist: trackInfo.artist,
                    artist_id: trackInfo.artist_id,
                    thumbnail: trackInfo.thumbnail
                }),
                success: function(response) {
                    console.log('Трек сохранен в истории:', response);
                },
                error: function(error) {
                    console.error('Ошибка при сохранении трека в истории:', error);
                }
            });
        } catch (error) {
            console.error('Ошибка при сохранении истории:', error);
        }
    }

    // Функция для загрузки профиля пользователя
    function loadProfile(callback) {
        if (!getAccessToken()) {
            if (callback) callback({ error: 'Не авторизован' });
            return;
        }

        $.ajax({
            url: '/api/user/profile',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            },
            success: function(response) {
                if (callback) callback(response);
            },
            error: function(xhr) {
                if (callback) callback({ error: 'Ошибка загрузки профиля' });
                handleAuthError(xhr);
            }
        });
    }

    // Функция для загрузки истории прослушивания
    function loadHistory(callback) {
        if (!getAccessToken()) {
            if (callback) callback({ error: 'Не авторизован' });
            return;
        }

        $.ajax({
            url: '/api/user/history',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            },
            success: function(response) {
                if (callback) callback(response);
            },
            error: function(xhr) {
                if (callback) callback({ error: 'Ошибка загрузки истории' });
                handleAuthError(xhr);
            }
        });
    }

    // Функция для загрузки плейлистов пользователя
    function loadPlaylists(callback) {
        if (!getAccessToken()) {
            if (callback) callback({ error: 'Не авторизован' });
            return;
        }

        $.ajax({
            url: '/api/user/playlists',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            },
            success: function(response) {
                if (callback) callback(response);
            },
            error: function(xhr) {
                if (callback) callback({ error: 'Ошибка загрузки плейлистов' });
                handleAuthError(xhr);
            }
        });
    }

    // Функция для загрузки подписок на исполнителей
    function loadFollowedArtists(callback) {
        if (!getAccessToken()) {
            if (callback) callback({ error: 'Не авторизован' });
            return;
        }

        $.ajax({
            url: '/api/user/followed-artists',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            },
            success: function(response) {
                if (callback) callback(response);
            },
            error: function(xhr) {
                if (callback) callback({ error: 'Ошибка загрузки подписок' });
                handleAuthError(xhr);
            }
        });
    }

    // Функция для обновления интерфейса после авторизации
    function updateUIAfterAuth(user) {
        $('#auth-buttons').addClass('hidden');
        $('#user-menu-content').removeClass('hidden');
        $('#user-name').text(user.name);
        $('#u-avatar').text(user.name[0].toUpperCase());
        
        // Загружаем подписки в сайдбар
        loadFollowedArtistsSidebar();
    }

    // Функция для обновления интерфейса после выхода
    function updateUIAfterLogout() {
        $('#user-menu-content').addClass('hidden');
        $('#auth-buttons').removeClass('hidden');
        $('#user-menu-dropdown').addClass('hidden');
    }

    // Функции для работы с модальными окнами
    function showModal(modalId) {
        $(`#${modalId}`).fadeIn(200);
    }

    function hideModal(modalId) {
        $(`#${modalId}`).fadeOut(200);
    }

    function showError(inputId, message) {
        $(`#${inputId}-error`).text(message).show();
    }

    function hideError(inputId) {
        $(`#${inputId}-error`).hide();
    }

    // Инициализация обработчиков событий для авторизации
    $(document).ready(function() {
        // Обработчики для модальных окон
        $('#login-button').on('click', () => showModal('login-modal'));
        $('#register-button').on('click', () => showModal('register-modal'));
        $('#show-register').on('click', () => {
            hideModal('login-modal');
            showModal('register-modal');
        });
        $('#show-login').on('click', () => {
            hideModal('register-modal');
            showModal('login-modal');
        });

        // Закрытие модальных окон
        $('#login-modal-close, #register-modal-close').on('click', function() {
            const modalId = $(this).closest('[id$="-modal"]').attr('id');
            hideModal(modalId);
        });

        // Закрытие по клику вне модального окна
        $('.modal-backdrop').on('click', function() {
            const modalId = $(this).parent().attr('id');
            hideModal(modalId);
        });

        // Закрытие по Escape
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                $('[id$="-modal"]').each(function() {
                    if ($(this).is(':visible')) {
                        hideModal($(this).attr('id'));
                    }
                });
            }
        });

        // Обработка формы входа
        $('#login-form').on('submit', function(e) {
            e.preventDefault();
            
            const email = $('#login-email').val();
            const password = $('#login-password').val();

            hideError('login-email');
            hideError('login-password');

            $.ajax({
                url: '/api/auth/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email, password }),
                success: function(response) {
                    saveTokens(response.tokens);
                    updateUIAfterAuth(response.user);
                    hideModal('login-modal');
                    $('#login-form')[0].reset();
                },
                error: function(xhr) {
                    const response = xhr.responseJSON;
                    if (response.error) {
                        showError('login-email', response.error);
                    }
                }
            });
        });

        // Обработка формы регистрации
        $('#register-form').on('submit', function(e) {
            e.preventDefault();
            
            const name = $('#register-name').val();
            const email = $('#register-email').val();
            const password = $('#register-password').val();
            const passwordConfirm = $('#register-password-confirm').val();

            hideError('register-name');
            hideError('register-email');
            hideError('register-password');
            hideError('register-password-confirm');

            if (password !== passwordConfirm) {
                showError('register-password-confirm', 'Пароли не совпадают');
                return;
            }

            $.ajax({
                url: '/api/auth/register',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ name, email, password }),
                success: function(response) {
                    saveTokens(response.tokens);
                    updateUIAfterAuth(response.user);
                    hideModal('register-modal');
                    $('#register-form')[0].reset();
                },
                error: function(xhr) {
                    const response = xhr.responseJSON;
                    if (response.error) {
                        showError('register-email', response.error);
                    }
                }
            });
        });

        // Обработка выхода
        $('#logout-button').on('click', function() {
            $.ajax({
                url: '/api/auth/logout',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                },
                success: function() {
                    removeTokens();
                    updateUIAfterLogout();
                }
            });
        });

        // Обработка меню пользователя
        $('#user-menu-button').on('click', function(e) {
            e.stopPropagation();
            $('#user-menu-dropdown').toggleClass('hidden');
        });

        // Закрытие меню при клике вне его
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#user-menu').length) {
                $('#user-menu-dropdown').addClass('hidden');
            }
        });

        // Предотвращаем закрытие при клике внутри меню
        $('#user-menu-dropdown').on('click', function(e) {
            e.stopPropagation();
        });

        // Проверяем состояние авторизации при загрузке страницы
        if (getAccessToken() && !isTokenExpired()) {
            $.ajax({
                url: '/api/auth/check',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                },
                success: function(response) {
                    if (response.authenticated) {
                        updateUIAfterAuth(response.user);
                    } else {
                        removeTokens();
                        updateUIAfterLogout();
                    }
                },
                error: function() {
                    removeTokens();
                    updateUIAfterLogout();
                }
            });
        } else if (getRefreshToken()) {
            refreshTokens()
                .then(function(response) {
                    saveTokens(response.tokens);
                    return $.ajax({
                        url: '/api/auth/check',
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${response.tokens.access_token}`
                        }
                    });
                })
                .then(function(response) {
                    if (response.authenticated) {
                        updateUIAfterAuth(response.user);
                    } else {
                        removeTokens();
                        updateUIAfterLogout();
                    }
                })
                .catch(function() {
                    removeTokens();
                    updateUIAfterLogout();
                });
        }

        // Добавляем токен ко всем AJAX запросам
        $.ajaxSetup({
            beforeSend: function(xhr) {
                const token = getAccessToken();
                if (token && !isTokenExpired()) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
            },
            error: function(xhr) {
                if (xhr.status === 401 && getRefreshToken()) {
                    refreshTokens()
                        .then(function(response) {
                            saveTokens(response.tokens);
                            const originalRequest = xhr.config;
                            originalRequest.headers['Authorization'] = `Bearer ${response.tokens.access_token}`;
                            return $.ajax(originalRequest);
                        })
                        .catch(function() {
                            removeTokens();
                            updateUIAfterLogout();
                        });
                }
            }
        });
    });
