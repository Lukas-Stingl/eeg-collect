import numpy as np
import matplotlib.pyplot as plt

def plot_frequency_spectrum(eeg_data, sampling_rate):
    # Compute the power spectral density (PSD) using FFT
    freqs = np.fft.rfftfreq(len(eeg_data), d=1/sampling_rate)
    psd = np.abs(np.fft.rfft(eeg_data))**2

    # Plot the frequency spectrum
    plt.figure(figsize=(10, 6))
    plt.plot(freqs, psd, color='blue')
    plt.title('Frequency Spectrum of EEG Data')
    plt.xlabel('Frequency (Hz)')
    plt.ylabel('Power (microvolts^2 / Hz)')
    plt.grid(True)
    plt.show()

def calcImpedance(eeg_data):
    # Compute the power spectral density (PSD) using FFT
    stdUv = np.std(eeg_data)
    print(stdUv)
    value = (np.sqrt( 2.0 ) * (stdUv) * 1.0e-6 / 6.0e-9) - 2200
    print(value)


if __name__ == '__main__':
    # Example usage
      # Insert the EEG data provided by the user
    sampling_rate = 250  # Insert the sampling rate of the EEG data

    eeg_data =  [
        0.0010579836963364895,
        0.0168992215530268,
        0.023256118908262725,
        0.01629624154256509,
        -0.0001547697490781557,
        -0.016718080662271238,
        -0.023830091114075448,
        -0.017289251590325756,
        -0.0007500089222970312,
        0.01632305241184699,
        0.02409326713001555,
        0.018045018151369965,
        0.001622283481456113,
        -0.015737170569828297,
        -0.024047069993565234,
        -0.01854320035466931,
        -0.002430001420146145,
        0.014988801820909127,
        0.02370267066705248,
        0.018772468554814226,
        0.00314475115303714,
        -0.014109780070487169,
        -0.02307984450180121,
        -0.018730669333470663,
        -0.0037431265929212683,
        0.013133572778157568,
        0.022205609494128625,
        0.018424590361170442,
        0.004207679165349681,
        -0.01209365907895772,
        -0.021112741090882944,
        -0.01786931564284401,
        -0.004527398723095072,
        0.011022174237135083,
        0.019838208502891398,
        0.01708722311691874,
        0.0046977722006042565,
        -0.009948814864571118,
        -0.01842159318792944,
        -0.016106722142852883,
        -0.004720495130236373,
        0.008899991286334188,
        0.016903536329883385,
        0.01496081368230314,
        0.004602921755414103,
        -0.007898179617062791,
        -0.015324241592343553,
        -0.013685568178260324,
        -0.004357357984409313,
        0.006961435146700534,
        0.013722088035954682,
        0.012318623176454078,
        0.004000265097585197,
        -0.006103080883997167,
        -0.012132425621242445,
        -0.010897765009963057,
        -0.003551383419514495,
        0.0053316088892784545,
        0.010586596900286075,
        0.009459616658077626,
        0.0030327777193798876,
        -0.004650804272374242,
        -0.009111206552837162,
        -0.008038463603260026,
        -0.0024678301882837704,
        0.0040600914484267385,
        0.007727665952219854,
        0.006665255939769866,
        0.001880211077575611,
        -0.0035550923500309146,
        -0.006452026756196721,
        -0.005366821483014667,
        -0.0012928679790321423,
        0.003128368527280668,
        0.005295099842051143,
        0.0041653118353987524,
        0.0007270780656354426,
        -0.002770291321810021,
        -0.004262819488286137,
        -0.0030778895785102084,
        -0.00020162537676950127,
        0.0024699601910713772,
        0.0033568044718156236,
        0.002116661313610274,
        -0.00026785297899777267,
        -0.0022161096452683843,
        -0.0025750564417364543,
        -0.0012888138853939962,
        0.0006693502125250344,
        0.001997942044088832,
        0.0019126956781499204,
        0.000596879760628515,
        -0.000994796893790407,
        -0.0018058048893630138,
        -0.0013626391436313465,
        -3.908766157794693e-05,
        0.001240168481071238,
        0.0016316575363916242,
        0.0009161793206231408,
        -0.00039021048613157547,
        -0.0014053807559683388,
        -0.0014693146387786409,
        -0.0005634636015866403,
        0.0007000282553190745,
        0.0014939729868256456,
        0.0013144855089321395,
        0.00029390248146726256,
        -0.0009021403022105588,
        -0.001512607340691886,
        -0.0011646570904420598,
        -9.65314522690889e-05,
        0.0010104075722337277,
        0.0014704376613537027,
        0.0010188624281757621,
        -3.967110591375136e-05,
        -0.0010400667296647933,
        -0.0013783962814105165,
        -0.0008773721851971134,
        0.0001255025037675127,
        0.001007013616411758,
        0.0012484535688059356,
        0.0007413566324251836,
        -0.00017128255421300397,
        -0.0009271165415745316,
        -0.0010929027245716813,
        -0.0006125519846798944,
        0.00018662874904986612,
        0.0008155839358940666,
        0.000923699636958663,
        0.0004929514307926812,
        -0.00018025653473022264,
        -0.0006864006017386489,
        -0.00075187990331788,
        -0.0003845339801827136,
        0.00015981133438207036,
        0.0005518522528164625,
        0.000587067383042212,
        0.0002890284970449841,
        -0.00013174675118378485,
        -0.00042215092501601397,
        -0.0004370776371282805,
        -0.0002077100599245677,
        0.0001012525223602319,
        0.00030516497369700255,
        0.00030762285873528066,
        0.00014123747504649962,
        -7.222750792138926e-05,
        -0.00020625945464583433,
        -0.0002021334053421112,
        -8.954626500226552e-05
    ]
    plot_frequency_spectrum(eeg_data, sampling_rate)
    calcImpedance(eeg_data)